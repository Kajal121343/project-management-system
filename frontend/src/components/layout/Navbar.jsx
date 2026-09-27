import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  LogOut,
  FolderKanban,
  LayoutDashboard,
  Users as UsersIcon,
  ChevronDown,
  CheckCheck,
  Moon,
  Sun,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { logout } from "../../features/auth/authSlice.js";
import { toggleTheme } from "../../features/ui/uiSlice.js";
import {
  fetchNotifications,
  markRead,
  markAllRead,
} from "../../features/notifications/notificationsSlice.js";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { list, unreadCount } = useSelector((s) => s.notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [user, dispatch]);

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLink = ({ isActive }) =>
    clsx(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
      isActive
        ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-400"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
    );

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 dark:bg-slate-900 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 hidden sm:inline dark:text-white">
               TaskTracky
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" className={navLink}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/projects" className={navLink}>
                <FolderKanban className="w-4 h-4" />
                Projects
              </NavLink>
              {user?.role === "ADMIN" && (
                <NavLink to="/admin/users" className={navLink}>
                  <UsersIcon className="w-4 h-4" />
                  Users
                </NavLink>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden dark:bg-slate-900 dark:border-slate-700">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => dispatch(markAllRead())}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {list.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      list.map((n) => (
                        <div
                          key={n._id}
                          onClick={() =>
                            !n.isRead && dispatch(markRead(n._id))
                          }
                          className={clsx(
                            "px-4 py-3 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800",
                            !n.isRead && "bg-brand-50/50 dark:bg-slate-800/50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {!n.isRead && (
                              <span className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 dark:text-slate-200">
                                {n.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                                {formatDistanceToNow(new Date(n.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen((o) => !o)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition dark:hover:bg-slate-800"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.name}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:inline dark:text-slate-500" />
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden dark:bg-slate-900 dark:border-slate-700">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition dark:text-red-400 dark:hover:bg-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 -mt-1">
          <NavLink to="/dashboard" className={navLink}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={navLink}>
            <FolderKanban className="w-4 h-4" />
            Projects
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin/users" className={navLink}>
              <UsersIcon className="w-4 h-4" />
              Users
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.ui.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}