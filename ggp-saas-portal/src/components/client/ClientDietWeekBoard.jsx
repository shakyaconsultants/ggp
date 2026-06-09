import {
  countMealsInWeek,
  formatPlanDate,
  groupMealsByDay,
  isTodayDayOfWeek,
  mealKcal,
  mealLabel,
  mealSource,
  mealTypeClass,
  planStatus,
} from "../../utils/clientPlanHelpers";

function MealCard({ meal }) {
  const kcal = mealKcal(meal);
  return (
    <div className={`client-meal-card ${mealTypeClass(meal.meal_type)}`}>
      <div className="client-meal-card-top">
        <span className="client-meal-type">{meal.meal_type}</span>
        <span className="client-meal-source">{mealSource(meal)}</span>
      </div>
      <p className="client-meal-name">{mealLabel(meal)}</p>
      <div className="client-meal-meta">
        {meal.quantity > 1 && <span>Qty × {meal.quantity}</span>}
        {kcal != null && <span>{kcal} kcal</span>}
      </div>
    </div>
  );
}

export default function ClientDietWeekBoard({ plan, onEdit, onDelete }) {
  const dayGroups = groupMealsByDay(plan.meals);
  const totalMeals = countMealsInWeek(dayGroups);
  const status = planStatus(plan.start_date, plan.end_date);
  const activeDays = dayGroups.filter((d) => d.meals.length > 0).length;
  const showActions = onEdit || onDelete;

  return (
    <div className="client-diet-week">
      <header className="client-diet-week-head">
        <div>
          <h4>
            Plan #{plan.id}
            <span className={`status-badge ${status.className}`}>{status.label}</span>
          </h4>
          <p className="muted">
            {formatPlanDate(plan.start_date)} → {formatPlanDate(plan.end_date)} · {totalMeals}{" "}
            meals across {activeDays} day{activeDays !== 1 ? "s" : ""}
          </p>
        </div>
        {showActions && (
          <div className="client-plan-actions">
            {onEdit && (
              <button type="button" className="btn btn-outline btn-sm" onClick={onEdit}>
                Edit plan
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        )}
      </header>

      {plan.notes && <p className="client-plan-notes">{plan.notes}</p>}

      <div className="client-week-board-wrap">
        <div className="client-week-board">
          {dayGroups.map((day) => (
            <div
              key={day.value}
              className={`client-week-day${day.meals.length ? " client-week-day--filled" : ""}${
                isTodayDayOfWeek(day.value) ? " client-week-day--today" : ""
              }`}
            >
              <div className="client-week-day-head">
                <span className="client-week-day-name">{day.short}</span>
                <span className="client-week-day-full">
                  {isTodayDayOfWeek(day.value) ? "Today · " : ""}
                  {day.label}
                </span>
                {day.meals.length > 0 && (
                  <span className="client-week-day-count">{day.meals.length}</span>
                )}
              </div>
              <div className="client-week-day-body">
                {day.meals.length === 0 ? (
                  <p className="client-week-empty">Rest day</p>
                ) : (
                  day.meals.map((meal, idx) => (
                    <MealCard key={meal.id || `${day.value}-${idx}`} meal={meal} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
