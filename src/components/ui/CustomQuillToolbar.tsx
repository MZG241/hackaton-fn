"use client";

import React from "react";
import CustomIcon from "./CustomIcon";

const ELITE_COLORS = [
  { name: "Deep Navy", hex: "#0e121a" },
  { name: "Primary Blue", hex: "#4355b9" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Error Red", hex: "#ff5252" },
  { name: "Amethyst", hex: "#7000FF" },
  { name: "Slate", hex: "#64748b" },
  { name: "White", hex: "#ffffff" },
];

export const CustomQuillToolbar = () => (
  <div id="custom-toolbar" className="flex items-center gap-1 p-2 bg-white/50 backdrop-blur-md border-b border-outline-variant/10">
    <span className="ql-formats flex items-center gap-1 border-r border-outline-variant/10 pr-2 mr-2">
      <button className="ql-bold w-10 h-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center group">
         <CustomIcon name="text-bold" size={18} className="opacity-50 group-hover:opacity-100" />
      </button>
      <button className="ql-italic w-10 h-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center group">
         <CustomIcon name="text-italic" size={18} className="opacity-50 group-hover:opacity-100" />
      </button>
      <button className="ql-underline w-10 h-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center group">
         <CustomIcon name="text-underline" size={18} className="opacity-50 group-hover:opacity-100" />
      </button>
    </span>

    <span className="ql-formats flex items-center gap-1 border-r border-outline-variant/10 pr-2 mr-2">
      <button className="ql-list w-10 h-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center group" value="ordered">
         <CustomIcon name="task-square" size={18} className="opacity-50 group-hover:opacity-100" />
      </button>
      <button className="ql-list w-10 h-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center group" value="bullet">
         <CustomIcon name="task" size={18} className="opacity-50 group-hover:opacity-100" />
      </button>
    </span>

    <span className="ql-formats flex items-center gap-1">
      <select className="ql-color">
        {ELITE_COLORS.map((color) => (
          <option key={color.hex} value={color.hex} />
        ))}
      </select>
      <div className="absolute opacity-0 pointer-events-none">
          {/* Custom style for the color picker dropdown will be handled in CSS */}
      </div>
    </span>

    <span className="ql-formats">
      <button className="ql-clean w-10 h-10 rounded-xl hover:bg-error/5 hover:text-error transition-all flex items-center justify-center group">
         <CustomIcon name="refresh" size={18} className="opacity-50 group-hover:opacity-100" />
      </button>
    </span>
  </div>
);

export default CustomQuillToolbar;
