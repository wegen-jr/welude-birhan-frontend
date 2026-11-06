import StudentQRManager from "../../../Components/SundaySchool/StudentQRManager";

function StudentQRPage() {
  const token = localStorage.getItem("token");

  return (
    <StudentQRManager
      token={token}
      schoolName="WELUDE BIRHAN SCHOOL"
    />
  );
}

export default StudentQRPage;