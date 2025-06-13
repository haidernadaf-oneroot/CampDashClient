"use client";

const ActivityLog = ({ ticket, getAgentNameById }) => {
  return (
    <div className="bg-white rounded-b-lg">
      {ticket.remarks && ticket.remarks.length > 0 ? (
        <div className="">
          {ticket.remarks.map((remark, index) => (
            <div key={index} className="border-l-4  shadow-sm mb-3">
              <p className="text-sm text-gray-800">{remark.remark}</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                <p>
                  By{" "}
                  <span className="font-semibold text-gray-900">
                    {getAgentNameById(remark.by)}
                  </span>
                </p>
                <p className="text-right">
                  {new Date(remark.time).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No remarks yet.</p>
      )}
    </div>
  );
};

export default ActivityLog;
