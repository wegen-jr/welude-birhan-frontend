import { apiClient } from "../api";
import { memberService } from "../memberService";

/**
 * Normalizes phone numbers for reliable comparison across local and international formats
 * (e.g. "+251911223344", "0911223344", "911223344").
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  // In Ethiopia, phone numbers have 9 significant digits (e.g., 911223344)
  if (digits.length >= 9) {
    return digits.slice(-9);
  }
  return digits;
}

export function isSamePhone(phoneA, phoneB) {
  if (!phoneA || !phoneB) return false;
  const a = normalizePhoneNumber(phoneA);
  const b = normalizePhoneNumber(phoneB);
  if (a && b && a === b) return true;
  return String(phoneA).trim() === String(phoneB).trim();
}

export const sundaySchoolService = {
  /**
   * Step 1: Generate or Fetch Student ID (POST /school-profile with fallback lookup).
   * Resolves the "limbo" problem: if the student ID was previously generated
   * but the student was never enrolled into a class, gracefully catches the duplicate
   * error, retrieves the existing student profile, and unlocks enrollment.
   */
  generateStudentId: async (phoneNumber) => {
    const cleanPhone = phoneNumber?.trim();
    if (!cleanPhone) {
      throw new Error("Phone number is required.");
    }

    let profile = null;
    let isExisting = false;

    try {
      // Primary Attempt: Generate new school profile
      profile = await apiClient("/school-profile", {
        method: "POST",
        body: { phoneNumber: cleanPhone },
      });
    } catch (err) {
      console.warn(
        "POST /school-profile returned an error. Initiating fallback lookup for existing student profile:",
        err
      );

      // 1. Check if error payload itself already carried the profile
      const candidate = err?.data?.data || err?.data?.profile || err?.data;
      if (candidate?.studentId || candidate?.student_id) {
        profile = candidate;
        isExisting = true;
      }

      // 2. Fallback: Query all school profiles (GET /school-profile) to find by phone
      if (!profile) {
        try {
          const profiles = await sundaySchoolService.getSchoolProfiles();
          if (Array.isArray(profiles) && profiles.length > 0) {
            const matchedProfile = profiles.find((p) =>
              isSamePhone(p.phoneNumber, cleanPhone)
            );
            if (matchedProfile) {
              profile = matchedProfile;
              isExisting = true;
              console.log(
                "Found existing student profile via /school-profile registry:",
                profile
              );
            }
          }
        } catch (fetchProfilesErr) {
          console.warn("Could not query school profiles list:", fetchProfilesErr);
        }
      }

      // 3. Fallback: Lookup member by phone in member directory and match memberId
      if (!profile) {
        try {
          const members = await memberService.getAllMembers();
          if (Array.isArray(members) && members.length > 0) {
            const matchedMember = members.find((m) =>
              isSamePhone(m.phoneNo || m.phone || m.phoneNumber, cleanPhone)
            );

            if (matchedMember) {
              const profiles = await sundaySchoolService.getSchoolProfiles();
              const profileByMember = profiles.find(
                (p) => Number(p.memberId) === Number(matchedMember.id)
              );
              if (profileByMember) {
                profile = {
                  ...profileByMember,
                  fullname: matchedMember.fullname || matchedMember.name || "",
                  christianName: matchedMember.christianName || "",
                  member: matchedMember,
                };
                isExisting = true;
                console.log(
                  "Found existing student profile via member ID correlation:",
                  profile
                );
              }
            }
          }
        } catch (memberErr) {
          console.warn("Could not query member directory for fallback:", memberErr);
        }
      }

      // If all fallbacks failed, rethrow original error
      if (!profile) {
        throw err;
      }
    }

    // Enrich with member information (e.g. fullname) if not yet populated
    const memberId = profile?.memberId || profile?.member_id;
    if (memberId && !profile?.fullname) {
      try {
        const member = await apiClient(`/member/${memberId}`);
        return {
          ...profile,
          studentId: profile.studentId || profile.student_id,
          memberId: Number(memberId),
          phoneNumber: profile.phoneNumber || profile.phone_number || cleanPhone,
          fullname: member?.fullname || member?.name || "",
          christianName: member?.christianName || "",
          member,
          isExisting,
        };
      } catch (enrichErr) {
        console.warn("Could not fetch extra member details:", enrichErr);
      }
    }

    return {
      ...profile,
      studentId: profile.studentId || profile.student_id,
      memberId: memberId ? Number(memberId) : undefined,
      phoneNumber: profile.phoneNumber || profile.phone_number || cleanPhone,
      fullname: profile.fullname || profile.full_name || "",
      isExisting,
    };
  },

  // Get all school profiles (GET /school-profile)
  getSchoolProfiles: async () => {
    const data = await apiClient("/school-profile");
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.profiles)) return data.profiles;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  // Step 2: Create Class (POST /class)
  createClass: async (classData) => {
    // classData: { gradeLevel, section }
    return await apiClient("/class", {
      method: "POST",
      body: {
        gradeLevel: classData.gradeLevel?.trim(),
        section: classData.section?.trim(),
      },
    });
  },

  // Get Active Classes (GET /class)
  getClasses: async () => {
    try {
      const data = await apiClient("/class");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.classes)) return data.classes;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    } catch (err) {
      console.warn("GET /class failed, trying /classes fallback:", err);
      const fallback = await apiClient("/classes").catch(() => []);
      if (Array.isArray(fallback)) return fallback;
      if (Array.isArray(fallback?.data)) return fallback.data;
      if (Array.isArray(fallback?.classes)) return fallback.classes;
      if (Array.isArray(fallback?.items)) return fallback.items;
      return [];
    }
  },

  // Alias for backward compatibility
  getActiveClasses: async () => {
    return await sundaySchoolService.getClasses();
  },

  /**
   * Step 2: Enroll Student (POST /class-enrollment)
   * Strictly adheres to CreateClassEnrollmentDto schema:
   *   - gradeLevel: string
   *   - section: string
   *   - memberId: number
   *   - studentId: string
   *   - fullname: string
   *   - year: number
   *   - status: string ("ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED")
   * 
   * NOTE: The backend's validation pipe forbids extra properties like "classId" or "class_id".
   * We explicitly exclude any class ID from the request body.
   */
  enrollStudent: async (enrollmentData) => {
    const rawStatus = String(enrollmentData.status || "ACTIVE").trim().toUpperCase();
    const validStatuses = ["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"];
    const status = validStatuses.includes(rawStatus) ? rawStatus : "ACTIVE";

    const payload = {
      gradeLevel: String(enrollmentData.gradeLevel).trim(),
      section: String(enrollmentData.section).trim(),
      memberId: parseInt(enrollmentData.memberId, 10),
      studentId: String(enrollmentData.studentId).trim(),
      fullname: String(enrollmentData.fullname).trim(),
      year: parseInt(enrollmentData.year, 10),
      status,
    };

    console.log("[sundaySchoolService.enrollStudent] Submitting payload to POST /class-enrollment:", payload);

    return await apiClient("/class-enrollment", {
      method: "POST",
      body: payload,
    });
  },

  updateEnrollment: async (id, data) => {
    const payload = {};
    if (data.gradeLevel !== undefined) payload.gradeLevel = String(data.gradeLevel).trim();
    if (data.section !== undefined) payload.section = String(data.section).trim();
    if (data.memberId !== undefined) payload.memberId = parseInt(data.memberId, 10);
    if (data.studentId !== undefined) payload.studentId = String(data.studentId).trim();
    if (data.fullname !== undefined) payload.fullname = String(data.fullname).trim();
    if (data.year !== undefined) payload.year = parseInt(data.year, 10);
    if (data.status !== undefined) {
      const rawStatus = String(data.status).trim().toUpperCase();
      const validStatuses = ["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"];
      if (validStatuses.includes(rawStatus)) payload.status = rawStatus;
    }

    return await apiClient(`/class-enrollment/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  deleteEnrollment: async (id) => {
    return await apiClient(`/class-enrollment/${id}`, {
      method: "DELETE",
    });
  },

  // List all enrollments (GET /class-enrollment)
  getEnrollments: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.gradeLevel) query.append("gradeLevel", params.gradeLevel);
    if (params.section) query.append("section", params.section);
    if (params.year) query.append("year", params.year);
    if (params.status) query.append("status", params.status);
    if (params.page) query.append("page", params.page);
    query.append("limit", params.limit || "100");

    const queryString = query.toString();
    const endpoint = `/class-enrollment?${queryString}`;
    try {
      const data = await apiClient(endpoint);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.enrollments)) return data.enrollments;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.results)) return data.results;
      return [];
    } catch (err) {
      console.warn("GET /class-enrollment error:", err);
      return [];
    }
  },

  // Fetch enrolled students for a specific class ID
  getEnrollmentsByClassId: async (classId) => {
    if (!classId) return [];
    try {
      const data = await apiClient(`/class-enrollment?classId=${encodeURIComponent(classId)}&limit=200`);
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.enrollments)) list = data.enrollments;
      if (list.length > 0) return list;
    } catch {
      // Fallback
    }

    try {
      const sub = await apiClient(`/class/${encodeURIComponent(classId)}/students`);
      if (Array.isArray(sub)) return sub;
      if (Array.isArray(sub?.data)) return sub.data;
      if (Array.isArray(sub?.students)) return sub.students;
      if (Array.isArray(sub?.items)) return sub.items;
      if (Array.isArray(sub?.results)) return sub.results;
    } catch {
      // Ignore
    }

    try {
      const all = await sundaySchoolService.getEnrollments({ limit: "500" });
      return (all || []).filter((e) => String(e.classId || e.class_id) === String(classId));
    } catch {
      return [];
    }
  },

  // Step 3: Get Class Roster (GET /class-enrollment/class/{gradeLevel})
  getClassRoster: async (gradeLevel, section) => {
    if (!gradeLevel) return [];
    const cleanGrade = encodeURIComponent(String(gradeLevel).trim());
    const query = new URLSearchParams();
    query.append("limit", "100");
    if (section) query.append("section", String(section).trim());

    let data;
    try {
      data = await apiClient(`/class-enrollment/class/${cleanGrade}?${query.toString()}`);
    } catch (err) {
      console.warn(`GET /class-enrollment/class/${cleanGrade} failed, attempting /class-enrollment query fallback:`, err);
      try {
        data = await apiClient(`/class-enrollment?gradeLevel=${cleanGrade}&limit=100`);
      } catch (fallbackErr) {
        console.warn("Fallback query also failed:", fallbackErr);
        return [];
      }
    }

    let list = [];
    if (Array.isArray(data)) list = data;
    else if (Array.isArray(data?.data)) list = data.data;
    else if (Array.isArray(data?.enrollments)) list = data.enrollments;
    else if (Array.isArray(data?.items)) list = data.items;
    else if (Array.isArray(data?.results)) list = data.results;

    // Filter section client-side if provided
    if (section && list.length > 0) {
      const targetSec = String(section).trim().toLowerCase();
      const filtered = list.filter((s) => {
        const sSec = String(s.section || "").trim().toLowerCase();
        return !sSec || sSec === targetSec;
      });
      if (filtered.length > 0) return filtered;
    }

    return list;
  },
};
