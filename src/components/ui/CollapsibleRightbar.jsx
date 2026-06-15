import React from "react";
import ProjectActivitySidebar from "@/features/project-overview/project-activity-sidebar/ProjectActivitySidebar";
//  @@deprecated use ProjectActivitySidebar directly
const CollapsibleRightbar = (props) => {
    return <ProjectActivitySidebar {...props} />;
};

export default CollapsibleRightbar;