export default function CronList({ crons, onDelete, onEdit, showActiveOnly = false }) {
  const filteredCrons = showActiveOnly
    ? crons.filter((cron) => cron.enabled)
    : crons;
  return (
    <section className="max-w-3xl mx-auto space-y-4">
      {filteredCrons.length === 0 ? (
        <p className="text-center text-gray-500 italic">No cron jobs found.</p>
      ) : (
        filteredCrons.map((cron) => (
          <article
            key={cron._id}
            className={`bg-white p-5 rounded-2xl shadow-md flex justify-between items-start hover:shadow-lg transition-shadow border-2 border-gray-100 ${cron.enabled ? "border-green-500" : "border-gray-300"}`}
          >
            <div className="space-y-1">
              <h3 className="font-semibold text-xl text-gray-800">{cron.name}</h3>
              <dl className="text-sm text-gray-600 mt-1 space-y-0.5">
                <div>
                  <dt className="font-medium inline">Schedule:</dt>{" "}
                  <dd className="inline">{cron.schedule}</dd>
                </div>
                <div>
                  <dt className="font-medium inline">HTTP Method:</dt>{" "}
                  <dd className="inline">{cron.httpMethod}</dd>
                </div>
                <div>
                  <dt className="font-medium inline">URI:</dt>{" "}
                  <dd className="inline">{cron.uri}</dd>
                </div>
                <div>
                  <dt className="font-medium inline">Time Zone:</dt>{" "}
                  <dd className="inline">{cron.timeZone}</dd>
                </div>
                {cron.body && (
                  <div>
                    <dt className="font-medium inline">Body:</dt>{" "}
                    <dd className="inline break-all">{cron.body}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => onEdit(cron)}
                aria-label={`Edit cron job ${cron.name}`}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(cron._id)}
                aria-label={`Delete cron job ${cron.name}`}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
