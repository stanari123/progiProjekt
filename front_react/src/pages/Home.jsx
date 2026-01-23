import { useState } from "react";
import Topbar from "../components/Topbar";
import ProfilePanel from "../components/ProfilePanel";
import BuildingSidebar from "../components/BuildingSidebar";
import DiscussionList from "../components/DiscussionList";
import BuildingMapPanel from "../components/BuildingMapPanel";
import "../index.css";
import { getAuth, setAuth } from "../utils/auth";
import { useEffect } from "react";

export default function Home() {
    const { token } = getAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const oauthToken = params.get("token");

        if (oauthToken) {
            setAuth(oauthToken, null);
            window.history.replaceState({}, "", window.location.pathname);
            window.location.reload();
            return;
        }

        if (!token) {
            window.location.href = "/login";
        }
    }, [token]);

    const [profileOpen, setProfileOpen] = useState(false);
    const [buildingId, setBuildingId] = useState(null);

    return (
        <>
            <Topbar onProfileToggle={() => setProfileOpen(true)} />

            <ProfilePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

            <main className="layout">
                <div className="left-col">
                    <BuildingSidebar onBuildingChange={setBuildingId} />
                </div>

                <div className="center-col">
                    <DiscussionList buildingId={buildingId} />
                </div>

                <div className="right-col">
                    <BuildingMapPanel buildingId={buildingId} />
                </div>
            </main>
        </>
    );
}
