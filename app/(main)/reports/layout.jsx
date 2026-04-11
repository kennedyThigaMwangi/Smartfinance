export default function ReportsLayout({ children }) {
  return (
    <div className="reports-no-footer">
      <style>{`
        .reports-no-footer footer {
          display: none !important;
        }
      `}</style>
      {children}
    </div>
  );
}