import React, { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { hasPermission } from "@/lib/utils";
import {
  RESOURCES,
  ACTIONS,
  getAllPermissions,
  parsePermission,
  PROJECT_GROUP_SECTIONS,
  PROJECT_FIELDS,
} from "@/constants/permissions";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import {
  Shield,
  Server,
  Monitor,
  CheckCircle,
  XCircle,
  HelpCircle,
  Play,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronRight,
  User,
  Users,
  Sliders,
  Search,
  BookOpen,
} from "lucide-react";

// Local predefined role permission lists matching DB seeds
const SEEDED_ROLES = {
  SuperAdmin: ["*"],
  Admin: [
    "dashboard:read",
    "dashboard:export-pdf",
    "user:read",
    "user:update",
    "role:read",
    "project:read",
    "project:update",
    "project-task:read",
    "project-task:create",
    "project-task:update",
    "internal-task:read",
    "internal-task:create",
    "internal-task:update",
    "sample:read",
    "dispatch:read",
    "sensory-form:read",
    "sensory-top-sheet:read",
    "shelf-life-testing:read",
    "cleaning:read",
    "maintenance:read"
  ],
  User: [
    "dashboard:read",
    "dashboard:export-pdf",
    "user:read",
    "user:update",
    "project:read",
    "project-task:read",
    "internal-task:read",
    "sample:read",
    "cleaning:read",
    "maintenance:read"
  ]
};

export default function PermissionDebugger() {
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [customPermissions, setCustomPermissions] = useState([]);
  const [testPermission, setTestPermission] = useState("project:read");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedResources, setExpandedResources] = useState({});
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill custom permissions editor when role changes
  useEffect(() => {
    if (selectedRole !== "custom") {
      setCustomPermissions([...SEEDED_ROLES[selectedRole]]);
    }
  }, [selectedRole]);

  // All valid system permissions from single source of truth
  const allSystemPermissions = useMemo(() => {
    try {
      return [...new Set(getAllPermissions())].sort();
    } catch {
      return [];
    }
  }, []);

  // Filtered system permissions based on search query
  const filteredPermissions = useMemo(() => {
    return allSystemPermissions.filter((perm) =>
      perm.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSystemPermissions, searchTerm]);

  // Group permissions by resource for visual hierarchy mapping
  const permissionsByResource = useMemo(() => {
    const map = {};
    allSystemPermissions.forEach((perm) => {
      const parts = perm.split(":");
      const resource = parts[0] || "unknown";
      if (!map[resource]) map[resource] = [];
      map[resource].push(perm);
    });
    return map;
  }, [allSystemPermissions]);

  const activePermissions = useMemo(() => {
    return selectedRole === "custom" ? customPermissions : SEEDED_ROLES[selectedRole] || [];
  }, [selectedRole, customPermissions]);

  // Perform Side-by-Side Verification (Client vs. Server)
  const handleVerify = async () => {
    setLoading(true);
    setVerificationResult(null);
    try {
      // 1. Client-Side Evaluation
      const clientGranted = hasPermission(activePermissions, testPermission);
      
      // 2. Server-Side Evaluation (simulating the active role or permissions array)
      const payload = {
        permission: testPermission,
        ...(selectedRole === "custom"
          ? { customPermissions: activePermissions }
          : { roleName: selectedRole })
      };
      
      const response = await api.post("/permissions/test", payload);
      
      setVerificationResult({
        clientGranted,
        serverGranted: response.data.granted,
        serverBreakdown: response.data.breakdown || [],
        serverListCount: response.data.permissionsCount,
        serverList: response.data.permissionsList || []
      });
      
      toast.success("Permissions evaluated successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to query permission server");
    } finally {
      setLoading(false);
    }
  };

  // Toggle custom permission in sandbox state
  const handleToggleCustomPermission = (perm) => {
    if (customPermissions.includes(perm)) {
      setCustomPermissions(customPermissions.filter((p) => p !== perm));
    } else {
      setCustomPermissions([...customPermissions, perm]);
    }
  };

  const toggleResourceExpand = (resource) => {
    setExpandedResources((prev) => ({
      ...prev,
      [resource]: !prev[resource],
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Permission Debugger & Sandbox"
          subtitle="Explore the RBAC model, simulate roles, and run side-by-side client/server permission checks."
        />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Wildcard Enforcement Mode: Active</span>
        </div>
      </div>

      {/* TOP DECK: Sandbox Configuration & Permission Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel 1: Persona / Sandbox configuration */}
        <div className="lg:col-span-1 p-6 rounded-3xl border border-border/60 bg-card/45 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">1. Impersonate User Perspective</h2>
              <p className="text-[10px] text-muted-foreground">Select a persona or edit the sandbox directly.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["SuperAdmin", "Admin", "User", "custom"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-20 ${
                  selectedRole === role
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]"
                    : "border-border bg-card/20 hover:border-border-hover text-muted-foreground"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  {role === "SuperAdmin" && <Shield className="w-4 h-4" />}
                  {role === "Admin" && <Users className="w-4 h-4" />}
                  {role === "User" && <User className="w-4 h-4" />}
                  {role === "custom" && <Sliders className="w-4 h-4" />}
                  
                  {selectedRole === role && (
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-bold capitalize">
                  {role === "custom" ? "Custom Sandbox" : role}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border/60 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-muted-foreground">Current Assigned Keys:</span>
              <span className="px-2 py-0.5 rounded bg-foreground/10 text-foreground font-bold">
                {activePermissions.length} / {allSystemPermissions.length}
              </span>
            </div>

            {selectedRole === "custom" ? (
              <div className="space-y-3">
                <p className="text-[10px] text-amber-500 font-medium">
                  ⚠️ Sandbox Mode: Check/uncheck permissions in the explorer below to build a custom payload.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-[10px]"
                    onClick={() => setCustomPermissions([])}
                  >
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-[10px]"
                    onClick={() => setCustomPermissions([...allSystemPermissions])}
                  >
                    Select All
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto pr-1 rounded-xl bg-foreground/5 p-3 space-y-1.5 border border-border/40">
                {activePermissions.includes("*") ? (
                  <span className="inline-block px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold">
                    * (Global Wildcard Access)
                  </span>
                ) : (
                  activePermissions.map((perm) => (
                    <div key={perm} className="flex justify-between items-center text-[10px] text-muted-foreground font-medium py-0.5 border-b border-border/20 last:border-0">
                      <span>{perm}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: side-by-side interactive check */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-border/60 bg-card/45 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-violet-500/15 border border-violet-500/20 text-violet-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">2. Side-by-Side Client & Server Tester</h2>
                <p className="text-[10px] text-muted-foreground">Select any permission and query server validation status live.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Select Permission to Verify:</label>
              <div className="relative">
                <select
                  value={testPermission}
                  onChange={(e) => setTestPermission(e.target.value)}
                  className="w-full p-3 pr-10 rounded-2xl bg-card border border-border focus:border-violet-500/40 text-xs font-semibold text-foreground appearance-none cursor-pointer"
                >
                  {allSystemPermissions.map((perm) => (
                    <option key={perm} value={perm}>
                      {perm}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <Button
              className="w-full py-6 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all duration-300"
              onClick={handleVerify}
              disabled={loading}
            >
              <Play className="w-4 h-4 fill-current" />
              {loading ? "Simulating Checks..." : "Run Side-by-Side Verification"}
            </Button>
          </div>

          {/* Results display */}
          {verificationResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/60">
              {/* Client Result Card */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                verificationResult.clientGranted
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                <div className="p-3 rounded-xl bg-card border border-inherit">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Client Side Helper</span>
                  <div className="flex items-center gap-1.5">
                    {verificationResult.clientGranted ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-extrabold">GRANTED</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-extrabold">DENIED</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Server Result Card */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                verificationResult.serverGranted
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                <div className="p-3 rounded-xl bg-card border border-inherit">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Server Validation</span>
                  <div className="flex items-center gap-1.5">
                    {verificationResult.serverGranted ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-extrabold">GRANTED (HTTP 200)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-extrabold">DENIED (HTTP 403)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-foreground/5 border border-dashed border-border/80 flex items-center justify-center gap-3 text-center text-xs text-muted-foreground">
              <Info className="w-4 h-4 shrink-0" />
              <span>Submit the test configuration to display client & server breakdown.</span>
            </div>
          )}
        </div>
      </div>

      {/* MID DECK: Server evaluation step breakdown log */}
      {verificationResult && (
        <div className="p-6 rounded-3xl border border-border/60 bg-card/45 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold text-foreground">Server Wildcard Resolution Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verificationResult.serverBreakdown.map((log, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  log.matched
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.15)]"
                    : "border-border bg-card/10 text-muted-foreground"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wide">{log.step}</span>
                    {log.matched ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-[8px] font-extrabold">PASSED</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-foreground/10 text-[8px] font-semibold text-muted-foreground">SKIPPED</span>
                    )}
                  </div>
                  <p className="text-[10px] leading-relaxed">{log.detail}</p>
                </div>
                
                {log.matched && (
                  <div className="mt-4 flex items-center gap-1 text-[8px] font-extrabold uppercase">
                    <CheckCircle className="w-3 h-3" />
                    <span>Resolves Permission Access</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOWER DECK: Fully interactive structured permissions hierarchy map */}
      <div className="p-6 rounded-3xl border border-border/60 bg-card/45 backdrop-blur-xl shadow-2xl space-y-6">
        
        {/* Header & filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">3. System-Wide Permissions Hierarchy Visualizer</h3>
            <p className="text-[10px] text-muted-foreground">
              Directly visualizes all 155 resources, actions, and nested scopes. Matched rules illuminate in <span className="text-emerald-400 font-bold">Green</span>.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 pl-9 rounded-2xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Dynamic Nested Grid Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[800px] overflow-y-auto pr-2">
          {Object.entries(permissionsByResource).map(([resourceName, perms]) => {
            const isExpanded = !!expandedResources[resourceName];
            
            // Check if any child permission is filtered out
            const filteredPerms = perms.filter((p) =>
              p.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filteredPerms.length === 0) return null;

            // Check if the persona has global wildcard access for this resource
            const hasResourceWildcard = activePermissions.includes(`${resourceName}:*`) || activePermissions.includes("*");

            return (
              <div key={resourceName} className="p-4 rounded-2xl border border-border/60 bg-card/15 backdrop-blur-md flex flex-col justify-between space-y-3">
                
                {/* Resource Header */}
                <div
                  className="flex justify-between items-center cursor-pointer select-none"
                  onClick={() => toggleResourceExpand(resourceName)}
                >
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${hasResourceWildcard ? "text-emerald-400" : "text-violet-400"}`} />
                    <span className="text-xs font-extrabold capitalize text-foreground">
                      {resourceName.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasResourceWildcard && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-400 text-[8px] font-extrabold">
                        WILDCARDED
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Sub Permissions (collapsible) */}
                {(isExpanded || searchTerm) && (
                  <div className="space-y-1.5 pt-2 border-t border-border/40 max-h-60 overflow-y-auto pr-1">
                    {filteredPerms.map((perm) => {
                      const isGranted = hasPermission(activePermissions, perm);
                      const parsed = parsePermission(perm);
                      const action = parsed.action;
                      const scope = parsed.scope;

                      return (
                        <div
                          key={perm}
                          onClick={() => {
                            setTestPermission(perm);
                            if (selectedRole === "custom") {
                              handleToggleCustomPermission(perm);
                            }
                          }}
                          className={`p-2 rounded-xl border text-[9px] font-semibold text-left transition-all duration-300 cursor-pointer flex justify-between items-center gap-2 ${
                            isGranted
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15"
                              : "border-border bg-card/15 hover:border-border-hover text-muted-foreground"
                          }`}
                        >
                          <div className="truncate flex items-center gap-1.5">
                            <span className="capitalize">{action}</span>
                            {scope && (
                              <span className="px-1 rounded bg-foreground/10 text-muted-foreground text-[8px]">
                                {scope}
                              </span>
                            )}
                          </div>
                          
                          <div className="shrink-0 flex items-center gap-1">
                            {isGranted ? (
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="text-[8px] text-muted-foreground flex justify-between">
                  <span>Category: {resourceName}</span>
                  <span>{filteredPerms.length} rules</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
