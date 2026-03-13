import { forwardRef } from "react";

export const Sound = forwardRef<HTMLSourceElement>((_props, ref) => {
  return (
    <div className="hidden">
      <audio controls>
        <source src="/tick1.webm" type="audio/webm" ref={ref} />
      </audio>
    </div>
  );
});

Sound.displayName = "Sound";
