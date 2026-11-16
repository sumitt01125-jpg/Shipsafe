import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Code2,
  Layers3,
} from "lucide-react";

const severityConfig = {
  CRITICAL: {
    color: "text-red-400",
    background: "bg-red-500/10",
    border: "border-red-500/20",
    icon: ShieldAlert,
  },

  HIGH: {
    color: "text-orange-400",
    background: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: AlertTriangle,
  },

  MEDIUM: {
    color: "text-yellow-400",
    background: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: AlertCircle,
  },

  LOW: {
    color: "text-blue-400",
    background: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Info,
  },
};

function ScanResults({ scan }) {
  if (!scan) return null;

  const summary = scan.summary || {};
  const findings = scan.findings || [];
  const architecture = scan.architecture || {};

  const severityCards = [
    { label: "Critical", key: "CRITICAL", color: "text-red-400" },
    { label: "High", key: "HIGH", color: "text-orange-400" },
    { label: "Medium", key: "MEDIUM", color: "text-yellow-400" },
    { label: "Low", key: "LOW", color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6">

      <section className="rounded-2xl border border-white/10 bg-[#101612] p-5">

        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-semibold text-white">
              Security Overview
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {scan.repository?.fullName || "Repository"}
            </p>
          </div>

          <span className="text-xs text-lime-400 flex items-center gap-2">
            <CheckCircle2 size={15} />
            {scan.status || "COMPLETED"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {severityCards.map((item) => (
            <div
              key={item.key}
              className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
            >
              <p className="text-xs text-gray-500">
                {item.label}
              </p>

              <p className={`text-2xl font-bold mt-2 ${item.color}`}>
                {summary[item.key] ?? 0}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06] text-xs text-gray-400">
          <span>
            Total issues: {summary.totalIssues ?? findings.length}
          </span>

          <span>
            Files analyzed: {scan.analyzedFiles ?? 0}
          </span>

          {scan.truncated && (
            <span className="text-yellow-400">
              Analysis file limit reached
            </span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#101612] p-5">

        <div className="flex items-center gap-2 mb-5">
          <Layers3 size={19} className="text-lime-400" />

          <h3 className="font-semibold text-white">
            Repository Overview
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          <div className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-xs text-gray-500">
              Project Type
            </p>

            <p className="text-white font-semibold mt-2">
              {architecture.projectType || "Unknown"}
            </p>
          </div>

          <div className="bg-white/[0.03] rounded-xl p-4">
            <p className="text-xs text-gray-500">
              Total Files
            </p>

            <p className="text-white font-semibold mt-2">
              {scan.totalFiles ?? architecture.totalFiles ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={16} className="text-lime-400" />

            <p className="text-sm font-medium text-white">
              Languages
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(architecture.languages || []).map((language) => (
              <span
                key={language}
                className="text-xs px-3 py-2 rounded-lg bg-blue-400/10 text-blue-300"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-white mb-3">
            Technologies Detected
          </p>

          <div className="flex flex-wrap gap-2">
            {(architecture.technologies || []).map((technology) => (
              <span
                key={technology}
                className="text-xs px-3 py-2 rounded-lg bg-lime-400/10 text-lime-300"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#101612] p-5">

        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-white">
            Security Findings
          </h3>

          <span className="text-xs text-gray-500">
            {findings.length} findings
          </span>
        </div>

        {findings.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2
              size={35}
              className="text-lime-400 mx-auto mb-3"
            />

            <p className="text-sm text-gray-300">
              No matching issues detected.
            </p>

            <p className="text-xs text-gray-500 mt-2">
              This does not guarantee that the repository is vulnerability-free.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {findings.map((finding, index) => {
              const config =
                severityConfig[finding.severity] || severityConfig.LOW;

              const Icon = config.icon;

              return (
                <div
                  key={finding.id || `${finding.filePath}-${index}`}
                  className={`rounded-xl border ${config.border} ${config.background} p-4`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      size={19}
                      className={`${config.color} mt-0.5 shrink-0`}
                    />

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">
                          {finding.title || "Security Finding"}
                        </h4>

                        <span className={`text-[10px] font-bold ${config.color}`}>
                          {finding.severity}
                        </span>

                        {finding.isResolved && (
                          <span className="text-[10px] text-lime-400">
                            RESOLVED
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2 leading-5">
                        {finding.description}
                      </p>

                      {finding.filePath && (
                        <p className="text-xs text-gray-500 mt-3 break-all">
                          {finding.filePath}
                          {finding.lineNumber
                            ? ` : ${finding.lineNumber}`
                            : ""}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <p className="text-xs text-gray-400">
                          <span className="text-lime-400 font-semibold">
                            Recommendation:{" "}
                          </span>

                          {finding.recommendation || "Review this finding."}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ScanResults;