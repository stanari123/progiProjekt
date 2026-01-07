import { useState } from "react";
import Topbar from "../components/Topbar";
import ProfilePanel from "../components/ProfilePanel";
import BuildingSidebar from "../components/BuildingSidebar";
import "../index.css";
import DiscussionList from "../components/DiscussionList";


export default function Home() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [buildingId, setBuildingId] = useState(null);

  return (
    <>
      <Topbar onProfileToggle={() => setProfileOpen(true)} />

      <ProfilePanel
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <main className="layout">
        {/* LEFT COLUMN */}
        <BuildingSidebar onBuildingChange={setBuildingId} />

        {/* CENTER COLUMN */}
        <div className="center-col">
          <DiscussionList buildingId={buildingId} />
        </div>


        {/* RIGHT COLUMN */}
        <div className="right-col"></div>
      </main>
    </>
  );
}
