import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Church,
  Images,
  CalendarDays,
  ArrowUpRight,
  MessageCircleCheck,
} from "lucide-react";

import { useLanguage } from "../../Contexts/LanguageContext";
import EventService from "../../services/cms/EventServices";
import GalleryService from "../../services/cms/GalleryServices";

export default function Dashboard() {
  const { isDarkMode } = useOutletContext();
  const { t } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [eventsData, galleryData] = await Promise.all([
          EventService.getEvents(),
          GalleryService.getGallery(),
        ]);

        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setGallery(Array.isArray(galleryData) ? galleryData : []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = [
    {
      title: t.cmsDashboard.stats.announcement,
      value: loading ? "..." : events.length,
      icon: CalendarDays,
    },
    {
      title: t.cmsDashboard.stats.gallery,
      value: loading ? "..." : gallery.length,
      icon: Images,
    },
    {
      title: t.cmsDashboard.stats.messages,
      value: "—",
      icon: MessageCircleCheck,
    },
    {
      title: t.cmsDashboard.stats.pages,
      value: "—",
      icon: Church,
    },
  ];

  /*
   * Build recent activity from real records.
   *
   * This is NOT an audit log.
   * It simply shows the most recent records returned by the database.
   */
  const recentActivities = [
    ...events.map((event) => ({
      type: "event",
      text: event.title,
      date: event.updatedAt || event.createdAt || event.eventDate,
    })),

    ...gallery.map((item) => ({
      type: "gallery",
      text: item.mediaTitle,
      date: item.updatedAt || item.createdAt || item.eventDate,
    })),
  ]
    .filter((activity) => activity.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const formatActivityTime = (date) => {
    const activityDate = new Date(date);

    if (Number.isNaN(activityDate.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = now - activityDate;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return activityDate.toLocaleDateString();
  };

  const handleView = () => {
    navigate("/", {
      state: { from: location.pathname },
    });
  };

  return (
    <main
      className={`
        min-h-screen
        px-6 md:px-10 lg:px-12
        py-8
        transition-colors duration-300
        ${
          isDarkMode
            ? "bg-[#081226] text-slate-100"
            : "bg-[#faf9f6] text-[#1d2940]"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard
              size={18}
              strokeWidth={1.5}
              className="text-[#c9a44c]"
            />

            <span
              className={`
                text-[11px]
                uppercase
                tracking-[0.2em]
                ${
                  isDarkMode
                    ? "text-slate-500"
                    : "text-slate-400"
                }
              `}
            >
              {t.cmsDashboard.title}
            </span>
          </div>

          <h1
            className={`
              text-2xl md:text-3xl
              font-semibold
              tracking-tight
              ${
                isDarkMode
                  ? "text-white"
                  : "text-[#1d2940]"
              }
            `}
          >
            {t.cmsDashboard.welcome}
          </h1>

          <p
            className={`
              mt-2 text-sm
              ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            `}
          >
            {t.cmsDashboard.subtitle}
          </p>
        </div>

        <div
          className={`
            hidden sm:flex
            items-center gap-2
            text-xs
            ${
              isDarkMode
                ? "text-slate-500"
                : "text-slate-400"
            }
          `}
        >
          <span className="w-2 h-2 rounded-full bg-[#c9a44c]" />
          Sanctuary CMS
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className={`
            mb-6
            rounded-lg
            border
            px-4 py-3
            text-sm
            ${
              isDarkMode
                ? "border-red-400/20 bg-red-400/5 text-red-300"
                : "border-red-200 bg-red-50 text-red-600"
            }
          `}
        >
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className={`
                p-5
                rounded-xl
                border
                transition-colors duration-300
                ${
                  isDarkMode
                    ? "bg-[#0b1b3d] border-white/10"
                    : "bg-white border-slate-200"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`
                    w-9 h-9
                    rounded-lg
                    flex items-center justify-center
                    ${
                      isDarkMode
                        ? "bg-[#172743]"
                        : "bg-[#f2eadb]"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-[#c9a44c]"
                  />
                </div>

                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  className={
                    isDarkMode
                      ? "text-slate-600"
                      : "text-slate-300"
                  }
                />
              </div>

              <div className="mt-5">
                <p
                  className={`
                    text-2xl
                    font-semibold
                    ${
                      isDarkMode
                        ? "text-white"
                        : "text-[#1d2940]"
                    }
                  `}
                >
                  {stat.value}
                </p>

                <p
                  className={`
                    mt-1 text-xs
                    ${
                      isDarkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }
                  `}
                >
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Welcome */}
        <section
          className={`
            lg:col-span-2
            rounded-xl
            border
            p-7
            min-h-[260px]
            ${
              isDarkMode
                ? "bg-[#0b1b3d] border-white/10"
                : "bg-white border-slate-200"
            }
          `}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="
                w-10 h-10
                rounded-full
                border border-[#c9a44c]
                flex items-center justify-center
              "
            >
              <Church
                size={19}
                strokeWidth={1.4}
                className="text-[#c9a44c]"
              />
            </div>

            <div>
              <h2
                className={`
                  text-base font-semibold
                  ${
                    isDarkMode
                      ? "text-white"
                      : "text-[#1d2940]"
                  }
                `}
              >
                {t.cmsDashboard.sanctuary.title}
              </h2>

              <p
                className={`
                  text-xs mt-0.5
                  ${
                    isDarkMode
                      ? "text-slate-500"
                      : "text-slate-400"
                  }
                `}
              >
                {t.cmsDashboard.sanctuary.subtitle}
              </p>
            </div>
          </div>

          <p
            className={`
              max-w-xl
              text-sm
              leading-7
              ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            `}
          >
            {t.cmsDashboard.sanctuary.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              className="
                px-4 py-2.5
                rounded-lg
                bg-[#c9a44c]
                text-white
                text-xs
                font-medium
                hover:bg-[#b8943e]
                transition-colors
              "
            >
              {t.cmsDashboard.sanctuary.manageContent}
            </button>

            <button
              className={`
                px-4 py-2.5
                rounded-lg
                border
                text-xs
                font-medium
                ${
                  isDarkMode
                    ? "border-white/10 text-slate-300 hover:bg-white/5"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }
              `}
              onClick={handleView}
            >
              {t.cmsDashboard.sanctuary.viewWebsite}
            </button>
          </div>
        </section>

        {/* Recent activity */}
        <section
          className={`
            rounded-xl
            border
            p-6
            ${
              isDarkMode
                ? "bg-[#0b1b3d] border-white/10"
                : "bg-white border-slate-200"
            }
          `}
        >
          <h2
            className={`
              text-sm font-semibold
              ${
                isDarkMode
                  ? "text-white"
                  : "text-[#1d2940]"
              }
            `}
          >
            {t.cmsDashboard.recentActivity.title}
          </h2>

          <div className="mt-6 space-y-5">
            {loading ? (
              <p
                className={`
                  text-xs
                  ${
                    isDarkMode
                      ? "text-slate-500"
                      : "text-slate-400"
                  }
                `}
              >
                Loading...
              </p>
            ) : recentActivities.length === 0 ? (
              <p
                className={`
                  text-xs
                  ${
                    isDarkMode
                      ? "text-slate-500"
                      : "text-slate-400"
                  }
                `}
              >
                No recent activity.
              </p>
            ) : (
              recentActivities.map((activity, index) => (
                <Activity
                  key={`${activity.type}-${index}`}
                  text={activity.text}
                  type={activity.type}
                  time={formatActivityTime(activity.date)}
                  isDarkMode={isDarkMode}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Activity({
  text,
  type,
  time,
  isDarkMode,
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c9a44c] shrink-0" />

      <div>
        <p
          className={`
            text-xs
            ${
              isDarkMode
                ? "text-slate-300"
                : "text-slate-600"
            }
          `}
        >
          {type === "event"
            ? `Event: ${text}`
            : `Gallery: ${text}`}
        </p>

        <p
          className={`
            mt-1 text-[10px]
            ${
              isDarkMode
                ? "text-slate-600"
                : "text-slate-400"
            }
          `}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
