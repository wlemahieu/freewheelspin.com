import { Link } from "@remix-run/react";
import { SpinButton } from "./SpinButton";
import { PauseButton } from "./PauseButton";
import { SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import { PieStore, usePieStore } from "~/store/usePieStore";
import { SpeakerWaveIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";

export function Navbar() {
  const { isMuted, mute, setMuted, unMute } = usePieStore<PieStore>(
    (state) => state
  );

  function getLocalStorage() {
    return localStorage?.getItem("muted");
  }

  useEffect(() => {
    const storageIsMuted = getLocalStorage();
    if (storageIsMuted !== null && ["true", "false"].includes(storageIsMuted)) {
      const bool = storageIsMuted === "false" ? false : true;
      if (bool && !isMuted) {
        return setMuted(bool);
      }
      if (!bool && isMuted) {
        return setMuted(bool);
      }
    }
  }, [getLocalStorage, isMuted]);

  return (
    <nav className="z-10 w-full pl-2 pr-2 flex gap-x-2 text-center justify-between text-gray-800 py-2 items-center">
      <Link to="/">
        <span className="text-md font-extrabold">
          FreeWheel
          <span className="mx-[1px]">
            <SpinButton />
          </span>
          .com
        </span>
      </Link>
      <span
        className="absolute top-0 left-1/2 p-2"
        style={{ transform: "translateX(-50%)" }}
      >
        <PauseButton />
      </span>
      <span className="flex justify-between gap-x-2">
        <span className="cursor-pointer">
          {typeof isMuted === "boolean" ? (
            isMuted ? (
              <span onClick={unMute}>
                <SpeakerXMarkIcon className="w-8 h-8" />
              </span>
            ) : (
              <span onClick={mute}>
                <SpeakerWaveIcon className="w-8 h-8" />
              </span>
            )
          ) : null}
        </span>
        <Link
          to="mailto:softwarewes@gmail.com"
          className="text-white bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 shadow-blue-500/50 dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-3 py-1.5 text-center"
        >
          Contact
        </Link>
      </span>
    </nav>
  );
}
