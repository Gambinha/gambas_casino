"use client";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/app/contexts/socket-context";
import { useFirstRender } from "@/app/hooks/use-first-render-hook";
import { CrashState } from "./auxiliares/crash-state";
import { CaculateMultiplierByTime } from "./utils/calculate-multiplier";

export default function Page() {
  const INITIAL_CRASH_POINT = 1.0;

  const { socket } = useSocket();
  const isFirstRender = useFirstRender();

  // Emitted Socket Events
  const GAME_CRASH_START_EVENT = "game:crash:start";
  const GAME_CRASH_BET_EVENT = "game:crash:bet";

  // Listened Socket Events
  const GAME_CRASH_CURRENT_GAME_CONTEXT = "game:crash:current-game-context";
  const GAME_CRASH_WAITING_FOR_BETS_EVENT = "game:crash:waiting-for-bets";
  const GAME_CRASH_POINTS_HISTORIC_EVENT = "game:crash:points-historic";
  const GAME_CRASH_POINT_EVENT = "game:crash:point";

  const [gameState, setGameState] = useState<CrashState>(
    CrashState.WAITING_FOR_BETS
  );

  const [executeLastingBetTimeTimer, setExecuteLastingBetTimeTimer] =
    useState(false);
  const [lastingBetTime, setLastingBetTime] = useState(0);
  const [maxWaitingForBetsTime, setMaxWaitingForBetsTime] = useState(0);

  const [currentCrashPointStartDate, setCurrentCrashPointStartDate] =
    useState<Date>(new Date());
  const [currentCrashPoint, setCurrentCrashPoint] =
    useState(INITIAL_CRASH_POINT);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  const [lastCrashPoints, setLastCrashPoints] = useState<number[]>([]);

  const [betAmount, setBetAmount] = useState("0");
  const [betPreCrashStopPoint, setBetPreCrashStopPoint] = useState(0);

  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFirstRender) return;

    if (executeLastingBetTimeTimer) {
      startBetTimeCounter();
    }
  }, [executeLastingBetTimeTimer]);
  // Betting Time Counter - END

  useEffect(() => {
    if (socket) {
      socket.emit(GAME_CRASH_START_EVENT);

      socket.on(
        GAME_CRASH_CURRENT_GAME_CONTEXT,
        (context: {
          gameState: CrashState;
          waitingForBetsLastingTimeInMilliseconds: number;
          maxWaitingForBetsTimeInMilliseconds: number;
          crashPointsHistoric: number[];
          currentCrashPoint: number | null;
          currentCrashPointRunStartDate: Date | null;
        }) => {
          const {
            gameState: currGameState,
            waitingForBetsLastingTimeInMilliseconds,
            maxWaitingForBetsTimeInMilliseconds,
            crashPointsHistoric,
            currentCrashPoint,
            currentCrashPointRunStartDate,
          } = context;

          setGameState(currGameState);

          if (currGameState === CrashState.WAITING_FOR_BETS) {
            setLastingBetTime(
              Math.trunc(waitingForBetsLastingTimeInMilliseconds / 1000)
            );
            setExecuteLastingBetTimeTimer(true);
          }

          if (currGameState === CrashState.RUNNING) {
            setCurrentCrashPointStartDate(
              new Date(currentCrashPointRunStartDate!)
            );
            setCrashPoint(currentCrashPoint!);
          }

          setMaxWaitingForBetsTime(
            Math.trunc(maxWaitingForBetsTimeInMilliseconds / 1000)
          );
          setLastCrashPoints(crashPointsHistoric);
        }
      );

      socket.on(
        GAME_CRASH_POINT_EVENT,
        ({ crashPoint }: { crashPoint: number }) => {
          setCrashPoint(crashPoint);
          setCurrentCrashPointStartDate(new Date());
        }
      );

      socket.on(
        GAME_CRASH_WAITING_FOR_BETS_EVENT,
        ({
          betDurationTimeInMilliseconds,
        }: {
          betDurationTimeInMilliseconds: number;
        }) => {
          setGameState(CrashState.WAITING_FOR_BETS);
          setLastingBetTime(betDurationTimeInMilliseconds / 1000);
          setExecuteLastingBetTimeTimer(true);
        }
      );

      socket.on(
        GAME_CRASH_POINTS_HISTORIC_EVENT,
        ({ crashPointsHistoric }: { crashPointsHistoric: number[] }) => {
          setLastCrashPoints(crashPointsHistoric);
        }
      );
    }
  }, [socket]);

  // Betting Time Counter - START
  const startBetTimeCounter = () => {
    let timerInClosure = lastingBetTime;

    const interval = setInterval(() => {
      if (timerInClosure === 0) {
        clearInterval(interval);
        setExecuteLastingBetTimeTimer(false);
        return;
      }

      setLastingBetTime((prev) => {
        return prev - 1;
      });
      timerInClosure--;
    }, 1000);
  };

  useEffect(() => {
    if (isFirstRender) return;
    if (!crashPoint) return;

    setCurrentCrashPoint(INITIAL_CRASH_POINT);
  }, [crashPoint, isFirstRender]);

  useEffect(() => {
    if (isFirstRender) return;

    if (currentCrashPoint <= crashPoint) {
      let newCurrentCrashPoint = currentCrashPoint;
      do {
        const elapsedTimeInSeconds =
          (new Date().getTime() - currentCrashPointStartDate.getTime()) / 1000;

        newCurrentCrashPoint = CaculateMultiplierByTime(elapsedTimeInSeconds);
      } while (newCurrentCrashPoint == currentCrashPoint);

      setCurrentCrashPoint(newCurrentCrashPoint);
    } else {
      setLastCrashPoints((prev) => {
        return [...prev, currentCrashPoint];
      });
    }
  }, [currentCrashPoint, currentCrashPointStartDate, isFirstRender]);

  const bet = () => {
    if (gameState !== CrashState.WAITING_FOR_BETS) return;
    if (betAmount === "0") return;

    // Verificar se o usuário tem saldo suficiente
    socket?.emit(GAME_CRASH_BET_EVENT, {
      amount: Number(betAmount), // Verificar essa conversão
      preCrashStopPoint: betPreCrashStopPoint,
    });
  };

  return (
    <div
      id="roulette-container"
      className="
        relative
        w-[98%] min-w-96 h-[440px] 
        flex flex-row items-center bg-[#252F38] rounded-md"
    >
      <div
        id="roulette-infos-container"
        className="
        flex-1 h-full max-w-[17rem] w-[17rem] min-w-[14rem]
        p-4 flex flex-col justify-between 
      "
      >
        <div id="roulette-bets-container">
          <div
            id="timer-container"
            className="w-full h-5 bg-[#0F1923] rounded-md p-1 flex items-center  relative"
            style={{
              opacity: gameState !== CrashState.WAITING_FOR_BETS ? 0.5 : 1,
            }}
          >
            <div
              id="timer-counter"
              className="h-3 bg-red-500 rounded-sm absolute z-10"
              style={{
                width: `${(lastingBetTime / maxWaitingForBetsTime) * 96}%`,
              }}
            ></div>

            <span className="w-full text-xs text-center z-20">
              {gameState === CrashState.RUNNING
                ? "Rodando"
                : gameState === CrashState.WAITING_FOR_BETS
                ? `Girando em ${lastingBetTime}s`
                : "Aguradando novo round"}
            </span>
          </div>

          <span className="mt-4 text-xs">Quantia</span>
          <div
            id="roulette-bets-input-box"
            className="
              w-full h-10 relative
              flex items-center justify-center
            "
          >
            <input
              disabled={gameState !== CrashState.WAITING_FOR_BETS}
              style={{
                opacity: gameState !== CrashState.WAITING_FOR_BETS ? 0.5 : 1,
                cursor:
                  gameState !== CrashState.WAITING_FOR_BETS
                    ? "not-allowed"
                    : "pointer",
              }}
              placeholder="Quantia"
              type="text"
              value={betAmount}
              className="w-full h-full bg-[#0F1923] rounded-md pl-2 text-white outline-none text-xs"
              onChange={(e) => setBetAmount(e.target.value)}
            />
            <span className="absolute right-2 text-xs">R$</span>
          </div>

          <span className="mt-4 text-xs">Auto Retirar</span>
          <input
            disabled={gameState !== CrashState.WAITING_FOR_BETS}
            style={{
              opacity: gameState !== CrashState.WAITING_FOR_BETS ? 0.5 : 1,
              cursor:
                gameState !== CrashState.WAITING_FOR_BETS
                  ? "not-allowed"
                  : "pointer",
            }}
            placeholder="Quantia"
            type="number"
            value={betPreCrashStopPoint}
            className=" w-full h-10 bg-[#0F1923] rounded-md pl-2 text-white outline-none text-xs"
            onChange={(e) => setBetPreCrashStopPoint(Number(e.target.value))}
          />

          <button
            disabled={gameState !== CrashState.WAITING_FOR_BETS}
            style={{
              opacity: gameState !== CrashState.WAITING_FOR_BETS ? 0.5 : 1,
              cursor:
                gameState !== CrashState.WAITING_FOR_BETS
                  ? "not-allowed"
                  : "pointer",
            }}
            onClick={bet}
            className="mt-6 bg-[#a31f1f] w-full h-10 font-bold text-xs hover:bg-red-600 rounded-md transition duration-500 ease-out"
          >
            Apostar
          </button>
        </div>

        <div
          id="roulette-numbers-historic"
          className="w-full h-20 max-h-20 min-h-20 "
        >
          <h3 className=" text-sm">Últimos resultados</h3>

          <div
            id="numbers-historic-container"
            className="mt-4 w-full h-8 flex flex-row items-center gap-2 overflow-y-hidden overflow-x-hidden "
          >
            {lastCrashPoints.slice(-6).map((crashPoint, index) => (
              <div
                key={index}
                className="w-8 h-8 min-w-8 min-h-8 flex items-center justify-center rounded-sm text-white text-xs"
                style={{
                  color: crashPoint > 2 ? "green" : "red",
                  backgroundColor: "#0F1923",
                }}
              >
                {crashPoint.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        id="roulette-wheel-container"
        className="flex-auto border-l-2 border-[#626B78] flex flex-co h-full items-center justify-center"
      >
        <span>{currentCrashPoint.toFixed(2)}</span>
      </div>

      {/* {gameState === CrashState.RESOLVING_BETS && (
        <div
          id="resolving-bets-wrapper"
          className="w-full h-full opacity-70 bg-black absolute top-0 left-0 flex justify-center items-center"
        >
          <span className="font-bold text-xl">
            Aguardando início de novo Round...
          </span>
        </div>
      )} */}
    </div>
  );
}
