import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  Shield, 
  Settings, 
  Mail, 
  ArrowRight, 
  Clock, 
  Calendar,
  XCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export function LogDetailsModal({ open, onOpenChange, log, className }) {
  if (!log) return null;

  const formatDateTime = (isoString) => {
    if (!isoString) return { date: "-", time: "-", full: "-" };
    try {
      const date = new Date(isoString);
      const d = format(date, "d MMM yy").toUpperCase();
      const t = format(date, "hh:mm a");
      return {
        date: d,
        time: t,
        full: `${d} ${t}`
      };
    } catch (e) {
      return { date: "-", time: "-", full: "-" };
    }
  };

  const isIsoDate = (str) => {
    if (!str || typeof str !== 'string') return false;
    const isoDateRegEx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return isoDateRegEx.test(str);
  };

  const formatValue = (val) => {
    if (isIsoDate(val)) {
      const { full } = formatDateTime(val);
      return full;
    }
    return String(val || "None");
  };

  const { date, time } = formatDateTime(log.createdAt);

  const formatName = (user) => {
    if (!user) return "-";
    return user.name || user.email || "-";
  };

  const getLogType = (history) => {
    if (history.type) return history.type;
    const action = history.action || "";
    if (action.includes("INVITE")) return "invites";
    if (action.includes("ROLE_CHANGE") || action.includes("DEPARTMENT_CHANGE")) return "roles";
    if (action.includes("PERMISSION") || action.includes("ROLE_CREATED") || action.includes("ROLE_ARCHIVED") || action.includes("ROLE_UNARCHIVED") || action.includes("ROLE_UPDATED")) return "permissions";
    return "unknown";
  };

  const logType = getLogType(log);

  const getLogConfig = (type) => {
    switch (type) {
      case "invites":
        return {
          icon: Mail,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          title: "Invitation Log"
        };
      case "roles":
        return {
          icon: Settings,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          title: "Role Change Log"
        };
      case "permissions":
        return {
          icon: Shield,
          color: "text-purple-600",
          bgColor: "bg-purple-600/10",
          title: "System Access Log"
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          title: "Activity Log"
        };
    }
  };

  const config = getLogConfig(logType);
  const Icon = config.icon;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          "max-w-[480px] lg:max-w-[255px] xl:max-w-[341px] 2xl:max-w-[385px] 3xl:max-w-[480px] p-0 overflow-hidden border-none rounded-xl shadow-2xl",
          className
        )}
      >
        <div className="relative overflow-hidden flex flex-col max-h-[90vh]">
          {/* Subtle background decoration */}
          <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20", config.bgColor)} />
          
          <div className="px-4 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 pt-8 lg:pt-4.5 xl:pt-5.5 2xl:pt-6.5 3xl:pt-8 pb-4 lg:pb-3.5 xl:pb-3 2xl:pb-3.5 3xl:pb-4 flex flex-col min-h-0">
            <ModalHeader className="flex flex-col items-center justify-center space-y-2 text-center flex-none">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                className={cn("p-4 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-4 rounded-2xl shadow-sm border border-border/50", config.bgColor)}
              >
                <Icon className={cn("w-5 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-5 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8", config.color)} />
              </motion.div>
              
              <div className="space-y-1">
                <ModalTitle className="text-sm lg:text-xs xl:text-sm 2xl:text-lg 3xl:text-xl font-bold text-nav-highlight uppercase tracking-wider">
                  {config.title}
                </ModalTitle>
                <div className="flex items-center justify-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-medium text-lighter-text">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {time}</span>
                </div>
              </div>
            </ModalHeader>

            <div className="mt-2 flex-none">
              <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl md:rounded-2xl bg-muted/30 border border-border/40 leading-relaxed text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-center">
                {logType === "invites" && (
                  <p className="text-lighter-text">
                    <span className="font-bold text-nav-highlight">{formatName(log.managedBy)}</span> 
                    {" "}initiated an invitation for{" "}
                    <span className="font-bold text-nav-highlight">{log.changes?.email || log.targetId?.email}</span> 
                    {log.changes?.roleId && <> as <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">{log.changes.roleId}</span></>}
                  </p>
                )}
                
                {logType === "roles" && (
                  <p className="text-lighter-text">
                    <span className="font-bold text-nav-highlight">{formatName(log.managedBy)}</span> 
                    {" "}updated the access profile for{" "}
                    <span className="font-bold text-nav-highlight">{formatName(log.targetId)}</span>
                  </p>
                )}
                
                {logType === "permissions" && (
                  <p className="text-lighter-text">
                    <span className="font-bold text-nav-highlight">{formatName(log.managedBy)}</span> 
                    {" "}{log.action?.toLowerCase().replace(/_/g, " ")}{" "}
                    <span className="font-bold text-nav-highlight">{log.targetId?.name || log.changes?.name}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="max-h-[300px] lg:max-h-[160px] xl:max-h-[215px] 2xl:max-h-[240px] 3xl:max-h-[300px] overflow-y-auto px-1 py-2 custom-scrollbar mt-4 lg:mt-1 xl:mt-2 2xl:mt-3 3xl:mt-4">
              <AnimatePresence mode="wait">
                {log.changes && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                  >
                    {log.changes.permissions ? (
                      <div className="grid grid-cols-1 gap-3">
                        {['from', 'to'].map((dir) => (
                          <div key={dir} className="p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-xl border border-border/40 bg-background/50">
                            <h4 className="flex items-center gap-2 mb-3 text-[10px] lg:text-[6px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-bold uppercase tracking-widest text-lighter-text">
                              {dir === 'from' ? <XCircle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-green-500" />}
                              {dir === 'from' ? 'Previous Permissions' : 'Updated Permissions'}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {log.changes.permissions[dir]?.length > 0 ? (
                                log.changes.permissions[dir].map((perm, idx) => (
                                  <span key={idx} className="text-[11px] px-2 py-1 rounded-md bg-muted text-nav-highlight font-medium border border-border/30">
                                    {perm}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground italic">None assigned</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      Object.entries(log.changes).map(([key, value]) => {
                        if (key === 'permissions') return null;
                        const isObject = typeof value === 'object' && value !== null && ('from' in value || 'to' in value);
                        const label = key === 'newExpiry' ? 'Expiry Date' : key.replace(/([A-Z])/g, ' $1').trim();
                        
                        return (
                          <div key={key} className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl border border-border/40 bg-background/50 flex flex-col gap-1">
                            <h4 className="text-xs lg:text-[6px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-bold uppercase tracking-widest text-lighter-text">{label}</h4>
                            {isObject ? (
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 px-3 py-2 rounded-lg bg-red-50/30 dark:bg-red-900/10 border border-red-100/20 text-xs font-medium text-red-600 dark:text-red-400 truncate">
                                  {formatValue(value.from)}
                                </div>
                                <ArrowRight className="text-lighter-text flex-shrink-0" size={14} />
                                <div className="flex-1 px-3 py-2 rounded-lg bg-green-50/30 dark:bg-green-900/10 border border-green-100/20 text-xs font-bold text-green-600 dark:text-green-400 truncate">
                                  {formatValue(value.to)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold md:font-bold text-nav-highlight bg-primary/5 p-2 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 rounded-lg border border-primary/10">
                                {formatValue(value)}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <ModalFooter className="flex items-center justify-center p-6 bg-muted/20 border-t border-border/40 flex-none">
            <Button
              intent="primary"
              onClick={() => onOpenChange(false)}
              className="min-w-[140px] lg:min-w-[75px] xl:min-w-[100px] 2xl:min-w-[112px] 3xl:min-w-[140px] rounded-full h-11 lg:h-6.5 xl:h-7.5 2xl:h-8.5 3xl:h-11 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Close Details
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
}
