function NotificationToast({ notification }) {
  if (!notification) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-[70] rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
        notification.type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : notification.type === "info"
            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
            : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {notification.message}
    </div>
  );
}

export default NotificationToast;

