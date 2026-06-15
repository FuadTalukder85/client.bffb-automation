import React from "react";
import { Bug, X } from "lucide-react";

export const DebugPanel = ({
    showDebugPanel,
    setShowDebugPanel,
    user,
    permissions,
    allowedReadSections,
    allowedUpdateSections,
    fieldPermissionChecks,
}) => {
    if (!showDebugPanel) return null;

    return (
        <div className="mx-0 lg:mx-5 mb-4 bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bug size={20} />
                    Permission Debug Console
                </h3>
                <button
                    type="button"
                    onClick={() => setShowDebugPanel(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
                {/* User Info */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Current User</h4>
                    <div className="bg-gray-800 dark:bg-gray-900 p-3 rounded text-xs text-gray-300 font-mono overflow-x-auto">
                        <div><span className="text-gray-500">ID:</span> {user?._id || user?.id || "N/A"}</div>
                        <div><span className="text-gray-500">Name:</span> {user?.firstName || user?.name || "N/A"} {user?.lastName || ""}</div>
                        <div><span className="text-gray-500">Email:</span> {user?.email || "N/A"}</div>
                        <div><span className="text-gray-500">Role:</span> {user?.role || "N/A"}</div>
                    </div>
                </div>

                {/* All Permissions */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                        All Permissions ({permissions?.length || 0})
                    </h4>
                    <div className="bg-gray-800 dark:bg-gray-900 p-3 rounded text-xs text-gray-300 font-mono max-h-40 overflow-y-auto">
                        {permissions && permissions.length > 0 ? (
                            <ul className="space-y-1">
                                {permissions.map((perm, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className={perm.includes('project:') ? 'text-yellow-400' : 'text-gray-400'}>
                                            {perm}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-red-400">No permissions found</div>
                        )}
                    </div>
                </div>

                {/* Allowed Sections */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">Allowed Sections</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Read Sections:</div>
                            <div className="bg-gray-800 dark:bg-gray-900 p-2 rounded text-xs text-gray-300 font-mono">
                                {allowedReadSections && allowedReadSections.length > 0 ? (
                                    <ul className="space-y-1">
                                        {allowedReadSections.map((section, idx) => (
                                            <li key={idx} className="text-green-400">✓ {section}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-red-400">None</div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Update Sections:</div>
                            <div className="bg-gray-800 dark:bg-gray-900 p-2 rounded text-xs text-gray-300 font-mono">
                                {allowedUpdateSections && allowedUpdateSections.length > 0 ? (
                                    <ul className="space-y-1">
                                        {allowedUpdateSections.map((section, idx) => (
                                            <li key={idx} className="text-yellow-400">✓ {section}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-red-400">None</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Field Permission Checks */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">
                        Field Permission Checks ({fieldPermissionChecks.length} fields)
                    </h4>
                    <div className="bg-gray-800 dark:bg-gray-900 p-3 rounded text-xs max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                            {fieldPermissionChecks.map((field, idx) => (
                                <div key={idx} className="border-b border-gray-700 pb-2 last:border-0">
                                    <div className="flex items-start justify-between gap-4 mb-1">
                                        <div className="flex-1">
                                            <div className="text-white font-semibold">{field.label}</div>
                                            <div className="text-gray-400 font-mono text-xs">{field.path}</div>
                                            <div className="text-gray-500 text-xs">Section: {field.section}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className={`px-2 py-0.5 rounded text-xs ${field.canRead ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                {field.canRead ? '✓ Read' : '✗ Read'}
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-xs ${field.canUpdate ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-700 text-gray-400'}`}>
                                                {field.canUpdate ? '✓ Update' : '✗ Update'}
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-xs ${field.finalCanEdit ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>
                                                {field.finalCanEdit ? '✓ Can Edit' : '✗ Can Edit'}
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-xs ${field.canEdit ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-400'}`}>
                                                Config: {field.canEdit ? 'Editable' : 'Read-only'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-orange-400 mb-2">Summary</h4>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-gray-800 dark:bg-gray-900 p-2 rounded text-center">
                            <div className="text-gray-400">Total Fields</div>
                            <div className="text-white font-bold">{fieldPermissionChecks.length}</div>
                        </div>
                        <div className="bg-gray-800 dark:bg-gray-900 p-2 rounded text-center">
                            <div className="text-gray-400">Can Read</div>
                            <div className="text-green-400 font-bold">
                                {fieldPermissionChecks.filter(f => f.canRead).length}
                            </div>
                        </div>
                        <div className="bg-gray-800 dark:bg-gray-900 p-2 rounded text-center">
                            <div className="text-gray-400">Can Update</div>
                            <div className="text-yellow-400 font-bold">
                                {fieldPermissionChecks.filter(f => f.canUpdate).length}
                            </div>
                        </div>
                        <div className="bg-gray-800 dark:bg-gray-900 p-2 rounded text-center">
                            <div className="text-gray-400">Can Edit (Final)</div>
                            <div className="text-blue-400 font-bold">
                                {fieldPermissionChecks.filter(f => f.finalCanEdit).length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};