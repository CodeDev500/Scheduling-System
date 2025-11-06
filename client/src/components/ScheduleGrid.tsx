import ScheduleBadge from "./ScheduleBadge";

interface ClassSession {
  code: string;
  type: "lab1" | "lab2" | "lec";
  time: string;
}

interface ScheduleData {
  [day: string]: {
    [timeSlot: string]: ClassSession | null;
  };
}

const ScheduleGrid = () => {
  const days = [
    { key: "M", label: "M", color: "bg-[#E8C5B5]" },
    { key: "T", label: "T", color: "bg-[#B5D4E8]" },
    { key: "W", label: "W", color: "bg-[#D4C99C]" },
    { key: "TH", label: "TH", color: "bg-[#B5B5B5]" },
    { key: "F", label: "F", color: "bg-[#D4D4A8]" },
  ];

  const timeSlots = [
    { key: "morning1", label: "8:00AM - 9:30AM" },
    { key: "morning2", label: "10:00AM - 12:00" },
    { key: "afternoon", label: "2:30PM - 4:00PM" },
  ];

  const scheduleData: ScheduleData = {
    M: {
      morning1: { code: "CC 100 (LAB)", type: "lab1", time: "8:00AM - 9:30AM" },
      morning2: { code: "MAD 121 (LEC)", type: "lab2", time: "10:00AM - 12:00" },
      afternoon: { code: "CC 104(LAB)", type: "lab2", time: "2:30PM - 4:00PM" },
    },
    T: {
      morning1: { code: "MAD 121 (LAB)", type: "lab2", time: "8:00AM - 9:30AM" },
      morning2: { code: "SE 131 (LAB)", type: "lab1", time: "10:30AM - 12:00" },
      afternoon: null,
    },
    W: {
      morning1: { code: "SE 131 (LEC)", type: "lec", time: "7:30AM - 9:30AM" },
      morning2: { code: "CC 100 (LEC)", type: "lab1", time: "10:00AM - 12:00" },
      afternoon: null,
    },
    TH: {
      morning1: { code: "CC 100 (LAB)", type: "lab1", time: "8:00AM - 9:30AM" },
      morning2: { code: "CC 104(LEC)", type: "lab2", time: "10:00AM - 12:00" },
      afternoon: { code: "CC 104(LAB)", type: "lab2", time: "2:30PM - 4:00PM" },
    },
    F: {
      morning1: { code: "MAD 121 (LAB)", type: "lab2", time: "8:00AM - 9:30AM" },
      morning2: { code: "SE 131 (LAB)", type: "lab1", time: "10:30AM - 12:00" },
      afternoon: null,
    },
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] border border-schedule-grid-border bg-card">
        {/* Header Row */}
        <div className="grid grid-cols-6 border-b border-schedule-grid-border">
          <div className="p-3 border-r border-schedule-grid-border"></div>
          {days.map((day) => (
            <div
              key={day.key}
              className="p-3 text-center border-r border-schedule-grid-border last:border-r-0"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${day.color} text-foreground font-semibold`}>
                {day.label}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slot Rows */}
        {timeSlots.map((slot, index) => (
          <div
            key={slot.key}
            className="grid grid-cols-6 border-b border-schedule-grid-border last:border-b-0"
          >
            <div className="p-4 border-r border-schedule-grid-border bg-muted/30">
              <div className="flex items-center justify-center h-full">
                <div className="text-xs font-medium text-muted-foreground transform -rotate-180 uppercase tracking-wider" 
                     style={{ writingMode: 'vertical-rl' }}>
                  {index === 0 ? "MORNING" : index === 1 ? "" : "AFTERNOON"}
                </div>
              </div>
            </div>
            {days.map((day) => {
              const session = scheduleData[day.key]?.[slot.key];
              return (
                <div
                  key={`${day.key}-${slot.key}`}
                  className="p-3 border-r border-schedule-grid-border last:border-r-0 min-h-[100px]"
                >
                  {session && (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-foreground font-medium">
                        {session.code}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.time}
                      </div>
                      <ScheduleBadge type={session.type}>
                        {session.type === "lab1"
                          ? "LAB 1"
                          : session.type === "lab2"
                          ? "LAB 2"
                          : "LEC"}
                      </ScheduleBadge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;