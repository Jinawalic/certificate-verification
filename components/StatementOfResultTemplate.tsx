import React from "react";

interface StatementOfResultProps {
    studentName?: string;
    degreeType?: string;
    degreeClass?: string;
    issueDate?: string;
    serialNumber?: string;
    studentPhotoUrl?: string;
    className?: string;
    id?: string;
}

export const StatementOfResultTemplate: React.FC<StatementOfResultProps> = ({
    studentName = "",
    degreeType = "",
    degreeClass = "",
    issueDate = "",
    serialNumber = "",
    studentPhotoUrl = "",
    className = "",
    id,
}) => {
    return (
        <div
            id={id}
            className={`relative w-[794px] h-[1123px] mx-auto bg-white bg-cover bg-center select-none box-border shadow-2xl font-serif text-slate-900 shrink-0 ${className}`}
            style={{ backgroundImage: "url('/images/certificate-template.png')" }}
        >

            {/* Top Serial Number Area */}
            <div className="absolute top-[95px] right-[85px]">
                <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                    NSUK/SR-{serialNumber}
                </span>
            </div>

            {/* Passport Photo Slot (Top Right area matching original layout) */}
            <div className="absolute top-[295px] right-[65px] w-[95px] h-[125px] border border-slate-300 bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center">
                {studentPhotoUrl ? (
                    <img src={studentPhotoUrl} alt="Passport" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[10px] text-slate-400 text-center p-1">Passport Photo</span>
                )}
            </div>

            {/* Dynamic Text Layer aligned precisely with the template lines */}

            {/* 1. Student Name (Placed over the first blank line under "This is to certify that") */}
            <div className="absolute top-[514px] left-0 right-0 text-center">
                <h3 className="text-2xl font-normal italic tracking-wide text-slate-900 inline-block px-6">
                    {studentName}
                </h3>
            </div>

            {/* 2. Degree Type (Placed over the middle blank line) */}
            <div className="absolute top-[695px] left-0 right-0 text-center">
                <h4 className="text-xl font-normal italic text-slate-900 inline-block px-6">
                    {degreeType}
                </h4>
            </div>

            {/* 3. Class of Degree (Placed over the third blank line before the small disclaimer) */}
            <div className="absolute top-[780px] left-0 right-0 text-center">
                <p className="text-lg font-normal italic text-slate-900 inline-block px-6">
                    {degreeClass ? `(${degreeClass})` : ""}
                </p>
            </div>

            {/* 4. Issue Date (Placed above the Date signature line at the bottom right) */}
            <div className="absolute bottom-[162px] right-[50px] text-center w-[180px]">
                <span className="font-serif italic text-sm text-slate-900">
                    {issueDate}
                </span>
            </div>

        </div>
    );
};