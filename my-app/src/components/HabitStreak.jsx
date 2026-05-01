export default function HabitStreak({ streak, bestStreak }) {
  return (
    <div className="d-flex justify-content-center px-2">
      <div className="text-center">
        <p className="fs-5 fw-bold">{streak}</p>
        <p className="small">Current Streak</p>
      </div>
      <div className="text-center">
        <p className="fs-5 fw-bold">{bestStreak}</p>
        <p className="small">Best Streak</p>
      </div>
    </div>
  );
}