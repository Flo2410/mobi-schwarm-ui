import { clear_path } from "../../helper/rosbridge";

export const StatsDisplay = () => {
  return (
    <div
      className={`absolute top-0 left-0 z-10 grid w-1/4 grid-cols-2 px-4 py-2 m-2 text-white rounded-md select-none bg-black/40 backdrop-blur`}
    >
      <span>FPS</span>
      <span id="fps">0</span>

      <span>Point Count</span>
      <span id="point_count">0</span>

      <div className="flex justify-center col-span-2 mt-2">
        <button className="px-2 border rounded-md" onClick={() => clear_path()}>
          Clear Points
        </button>
      </div>
    </div>
  );
};
