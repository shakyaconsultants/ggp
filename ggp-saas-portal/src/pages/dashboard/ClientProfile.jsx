import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import { isProfileComplete } from "../../utils/clientProfileLabels";
import ClientProfileSidebar from "../../components/client/ClientProfileSidebar";
import ClientProfileTabs from "../../components/client/ClientProfileTabs";
import ClientOverviewTab from "../../components/client/ClientOverviewTab";
import ClientHealthTab from "../../components/client/ClientHealthTab";
import ClientDietsTab from "../../components/client/ClientDietsTab";
import ClientExercisesTab from "../../components/client/ClientExercisesTab";
import ClientChatTab from "../../components/client/ClientChatTab";

export default function ClientProfile() {
  const { notifyError } = useApiFeedback();
  const { clientId } = useParams();
  const { nutritionist } = useNutritionist();
  const [profile, setProfile] = useState(null);
  const [dietPlans, setDietPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const reloadPlans = useCallback(async () => {
    if (!nutritionist?.id || !clientId) return;
    const allPlans = await api.dietPlans(nutritionist.id);
    const plans = (Array.isArray(allPlans) ? allPlans : allPlans?.diet_plans || []).filter(
      (p) => Number(p.client_id) === Number(clientId)
    );
    plans.sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)));
    setDietPlans(plans);
  }, [nutritionist?.id, clientId]);

  const reloadExercises = useCallback(async () => {
    if (!nutritionist?.id || !clientId) return;
    const exerciseData = await api.clientExerciseAssignments(nutritionist.id, clientId);
    setExercises(exerciseData.assignments || []);
  }, [nutritionist?.id, clientId]);

  useEffect(() => {
    if (!nutritionist?.id || !clientId) return;

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const [profileData, allPlans, exerciseData] = await Promise.all([
          api.clientProfile(nutritionist.id, clientId),
          api.dietPlans(nutritionist.id),
          api.clientExerciseAssignments(nutritionist.id, clientId),
        ]);

        if (cancelled) return;

        const plans = (Array.isArray(allPlans) ? allPlans : allPlans?.diet_plans || []).filter(
          (p) => Number(p.client_id) === Number(clientId)
        );
        plans.sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)));

        setProfile(profileData);
        setDietPlans(plans);
        setExercises(exerciseData.assignments || []);
      } catch (e) {
        if (!cancelled) {
          notifyError(e);
          setProfile(null);
          setDietPlans([]);
          setExercises([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [nutritionist?.id, clientId, notifyError]);

  const tabCounts = useMemo(
    () => ({
      diets: dietPlans.length,
      exercises: exercises.length,
    }),
    [dietPlans.length, exercises.length]
  );

  const complete = isProfileComplete(profile);

  const handlePlansChange = useCallback(async () => {
    try {
      await reloadPlans();
    } catch (e) {
      notifyError(e);
    }
  }, [reloadPlans, notifyError]);

  const handleExercisesChange = useCallback(async () => {
    try {
      await reloadExercises();
    } catch (e) {
      notifyError(e);
    }
  }, [reloadExercises, notifyError]);

  function renderTab() {
    if (!profile) return null;
    switch (activeTab) {
      case "profile":
        return <ClientHealthTab profile={profile} />;
      case "diets":
        return (
          <ClientDietsTab
            clientId={clientId}
            clientName={profile.name}
            dietPlans={dietPlans}
            onPlansChange={handlePlansChange}
          />
        );
      case "exercises":
        return (
          <ClientExercisesTab
            clientId={clientId}
            exercises={exercises}
            onExercisesChange={handleExercisesChange}
          />
        );
      case "messages":
        return (
          <ClientChatTab
            nutritionistId={nutritionist.id}
            clientId={clientId}
            clientName={profile.name}
          />
        );
      default:
        return (
          <ClientOverviewTab
            profile={profile}
            dietPlans={dietPlans}
            exercises={exercises}
            onOpenTab={setActiveTab}
          />
        );
    }
  }

  return (
    <div className="page page-flush client-profile-page">
      <div className="page-toolbar client-profile-toolbar">
        <Link to="/dashboard/clients" className="back-link">
          ← Back to clients
        </Link>
        {profile && (
          <span className={`status-badge ${complete ? "status-active" : "status-pending"}`}>
            {complete ? "App profile complete" : "Awaiting app profile"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="card panel">
          <p className="muted">Loading client workspace…</p>
        </div>
      ) : !profile ? (
        <div className="card panel">
          <p className="muted">Client not found or you do not have access.</p>
        </div>
      ) : (
        <div className="client-profile-layout">
          <ClientProfileSidebar profile={profile} onOpenTab={setActiveTab} />

          <div className="client-profile-main">
            <ClientProfileTabs
              active={activeTab}
              onChange={setActiveTab}
              counts={tabCounts}
            />
            {renderTab()}
          </div>
        </div>
      )}
    </div>
  );
}

