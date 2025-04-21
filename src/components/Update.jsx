import React from "react";

const Update = () => {
  const handleUpadte = () => {
    console.log("update");
  };

  return (
    <div className="flex justify-end">
      <button
        className="w-20 h-7 border rounded-lg bg-green-600"
        onClick={handleUpadte}
      >
        update
      </button>
    </div>
  );
};

export default Update;
