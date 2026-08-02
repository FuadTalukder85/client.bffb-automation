import { AiFillThunderbolt } from "react-icons/ai";

export const SegmentActions = ({
  onEdit,
  onArchive,
  onRestore,
  data,
  isArchived = false,
  canUpdate = true,
  canDelete = true,
}) => {
  if (isArchived) {
    return (
      <div className="flex items-center justify-center">
        {canUpdate && (
          <button
            onClick={() => onRestore?.(data)}
            title="Restore"
            aria-label="Restore"
            className="action-button flex items-center justify-center gap-1.5 rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
          >
            <AiFillThunderbolt className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-0">
      {canUpdate && (
        <button
          onClick={() => onEdit?.(data)}
          title="Edit"
          aria-label="Edit"
          className="action-button flex items-center justify-center gap-1.5 rounded-l-md rounded-r-none hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
        </button>
      )}
      {canDelete && (
        <button
          onClick={() => onArchive?.(data)}
          title="Archive"
          aria-label="Archive"
          className={`action-button flex items-center justify-center gap-1.5 ${canUpdate ? "rounded-r-md rounded-l-none" : "rounded-md"} text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 ${canUpdate ? "border-l-table-stroke" : ""} transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`}
        >
          <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
        </button>
      )}
    </div>
  );
};

export default SegmentActions;
