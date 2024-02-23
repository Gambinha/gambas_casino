"use client";
import { useEffect, useState } from "react";
import RouletteWheel from "./components/roulette-wheel";
import { RouletteNumbers } from "./auxiliares/roulette-numbers";
import { RouletteBetOptions } from "./auxiliares/routellet-bets-options";
import { useSocket } from "@/app/contexts/socket-context";
import { RouletteState } from "./auxiliares/roulette-state";

export default function Page() {
  const { socket } = useSocket();

  const DEFAULT_SPIN_ANGLE = 360 * 10; // Valor inicial do angulo de rotação da roleta (10 giros)
  const ROULETTE_NUMBERS_CIRCUNFERENCE_ANGLE = 360 / RouletteNumbers.length; // Angulo de cada número da roleta

  const GAME_ROULETTE_START_EVENT = "game:roulette:start";
  const GAME_ROULETTE_LEAVE_EVENT = "game:roulette:leave";
  const GAME_ROULETTE_BET_EVENT = "game:roulette:bet";
  const GAME_ROULETTE_SPIN_EVENT = "game:roulette:spin";
  const GAME_ROULETTE_WAITING_FOR_BETS_EVENT = "game:roulette:waiting-for-bets";
  const GAME_ROULETTE_WINNER_EVENT = "game:roulette:winner";

  const [spinDegrees, setSpinDegrees] = useState(0);
  const [gameState, setGameState] = useState<RouletteState>(
    RouletteState.WAITING_FOR_BETS
  );

  const [executeLastingBetTimeTimer, setExecuteLastingBetTimeTimer] =
    useState(false);
  const [lastingBetTime, setLastingBetTime] = useState(0);

  const [sortedNumber, setSortedNumber] = useState<RouletteNumbers>({
    value: "00",
    color: "#355e3b",
  });
  const [lastSortedNumbers, setLastSortedNumbers] = useState<RouletteNumbers[]>(
    []
  );

  const [betAmount, setBetAmount] = useState("0");
  const [betOption, setBetOption] = useState<RouletteBetOptions>(
    RouletteBetOptions.GREEN
  );

  const startBetTimeCounter = () => {
    const interval = setInterval(() => {
      console.log("Started timer");
      console.log(lastingBetTime);
      if (lastingBetTime === 0) {
        console.log("Parar intervalo");
        clearInterval(interval);
        setExecuteLastingBetTimeTimer(false);
        return;
      }

      setLastingBetTime((prev) => {
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (socket) {
      socket.emit(GAME_ROULETTE_START_EVENT);

      socket.on(
        GAME_ROULETTE_SPIN_EVENT,
        ({ sortedNumber }: { sortedNumber: RouletteNumbers }) => {
          console.log("Apostas encerradas, vamos girar");
          console.log("sortedNumber: " + sortedNumber);

          setSortedNumber(sortedNumber);
        }
      );

      // Verificar eventos time_for_bets e waiting_for_bets
      socket.on(
        GAME_ROULETTE_WAITING_FOR_BETS_EVENT,
        ({
          betDurationTimeInMilliseconds,
        }: {
          betDurationTimeInMilliseconds: number;
        }) => {
          console.log(betDurationTimeInMilliseconds, "segundos para apostar");
          setGameState(RouletteState.WAITING_FOR_BETS);
          setLastingBetTime(betDurationTimeInMilliseconds / 1000);
          setExecuteLastingBetTimeTimer(true);
          console.log("Waiting for bets");
        }
      );

      socket.on(GAME_ROULETTE_WINNER_EVENT, ({ amount }) => {
        console.log("You win", amount);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (sortedNumber.value === "00") return;

    spinRoulette();
  }, [sortedNumber]);

  useEffect(() => {
    if (executeLastingBetTimeTimer) {
      startBetTimeCounter();
    }
  }, [executeLastingBetTimeTimer]);

  const spinRoulette = () => {
    setGameState(RouletteState.SPINNING);

    let currentNumberIndex = 0;
    let newNumberIndex = 0;

    RouletteNumbers.forEach((rouletteNumber, index) => {
      if (rouletteNumber.value === lastSortedNumbers.at(-1)?.value) {
        currentNumberIndex = index;
      }
      if (rouletteNumber.value === sortedNumber.value) {
        newNumberIndex = index;
      }
    });

    let rouletteNumbersAngleDistance = 0;

    if (spinDegrees > 360) {
      // Deve girar sentido anti-horário (Como o valor do angulo de rotação soma a cada giro da roleta,
      // para não chegar num limite de valor do JS decidi por fazer a rotação no sentido anti-horário quando o valor do angulo de rotação for maior que 360 graus)
      const leftSpinAngleDistance =
        newNumberIndex > currentNumberIndex
          ? newNumberIndex - currentNumberIndex
          : RouletteNumbers.length - (currentNumberIndex - newNumberIndex);

      rouletteNumbersAngleDistance =
        DEFAULT_SPIN_ANGLE * -1 -
        leftSpinAngleDistance * ROULETTE_NUMBERS_CIRCUNFERENCE_ANGLE;
    } else {
      // Deve girar sentido horário
      const rightSpinAngleDistance =
        newNumberIndex > currentNumberIndex
          ? RouletteNumbers.length - (newNumberIndex - currentNumberIndex)
          : currentNumberIndex - newNumberIndex;

      rouletteNumbersAngleDistance =
        DEFAULT_SPIN_ANGLE +
        rightSpinAngleDistance * ROULETTE_NUMBERS_CIRCUNFERENCE_ANGLE;
    }

    setSpinDegrees((prev) => prev + rouletteNumbersAngleDistance);
  };

  const bet = () => {
    if (gameState !== RouletteState.WAITING_FOR_BETS) return;
    if (betAmount === "0") return;

    // Verificar se o usuário tem saldo suficiente
    socket?.emit(GAME_ROULETTE_BET_EVENT, {
      amount: Number(betAmount), // Verificar essa conversão
      betOption,
    });
  };

  const onSpinRouletteComplete = () => {
    setGameState(RouletteState.RESOLVING_BETS);
    setLastSortedNumbers((prev) => [...prev, sortedNumber]);

    // Buscar o novo saldo
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
            id="roulette-bets-input-box"
            className="
          w-full h-10 relative
          flex items-center justify-center
        "
          >
            {gameState === RouletteState.WAITING_FOR_BETS && (
              <span>{lastingBetTime}s</span>
            )}

            <input
              disabled={gameState !== RouletteState.WAITING_FOR_BETS}
              style={{
                opacity: gameState !== RouletteState.WAITING_FOR_BETS ? 0.5 : 1,
                cursor:
                  gameState !== RouletteState.WAITING_FOR_BETS
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

          <h3 className="mt-6 text-sm">Selecionar Aposta</h3>

          <div
            id="roulette-bets-options-1"
            className="flex h-10 flex-row items-center justify-center mt-2 gap-2"
          >
            <button
              disabled={gameState !== RouletteState.WAITING_FOR_BETS}
              className="flex-1 h-full bg-[#a31f1f] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.RED ? "white" : "#a31f1f",
                opacity: gameState !== RouletteState.WAITING_FOR_BETS ? 0.5 : 1,
                cursor:
                  gameState !== RouletteState.WAITING_FOR_BETS
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={() => setBetOption(RouletteBetOptions.RED)}
            >
              2x
            </button>
            <button
              disabled={gameState !== RouletteState.WAITING_FOR_BETS}
              className="flex-1 h-full bg-[#355e3b] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.GREEN ? "white" : "#355e3b",
                opacity: gameState !== RouletteState.WAITING_FOR_BETS ? 0.5 : 1,
                cursor:
                  gameState !== RouletteState.WAITING_FOR_BETS
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={() => setBetOption(RouletteBetOptions.GREEN)}
            >
              14x
            </button>
            <button
              disabled={gameState !== RouletteState.WAITING_FOR_BETS}
              className="flex-1 h-full bg-[#171212] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.BLACK ? "white" : "#171212",
                opacity: gameState !== RouletteState.WAITING_FOR_BETS ? 0.5 : 1,
                cursor:
                  gameState !== RouletteState.WAITING_FOR_BETS
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={() => setBetOption(RouletteBetOptions.BLACK)}
            >
              2x
            </button>
          </div>

          <div
            id="roulette-bets-options-2"
            className="flex h-10 flex-row items-center justify-center mt-2 gap-2"
          >
            <button
              disabled={gameState !== RouletteState.WAITING_FOR_BETS}
              className="flex-1 h-full bg-[#a31f1f] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.ODD ? "white" : "#a31f1f",
                opacity: gameState !== RouletteState.WAITING_FOR_BETS ? 0.5 : 1,
                cursor:
                  gameState !== RouletteState.WAITING_FOR_BETS
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={() => setBetOption(RouletteBetOptions.ODD)}
            >
              PAR
            </button>
            <button
              disabled={gameState !== RouletteState.WAITING_FOR_BETS}
              className="flex-1 h-full bg-[#171212] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.EVEN ? "white" : "#171212",
                opacity: gameState !== RouletteState.WAITING_FOR_BETS ? 0.5 : 1,
                cursor:
                  gameState !== RouletteState.WAITING_FOR_BETS
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={() => setBetOption(RouletteBetOptions.EVEN)}
            >
              ÍMPAR
            </button>
          </div>

          <button
            disabled={gameState !== RouletteState.WAITING_FOR_BETS}
            style={{
              opacity: gameState !== RouletteState.WAITING_FOR_BETS ? 0.5 : 1,
              cursor:
                gameState !== RouletteState.WAITING_FOR_BETS
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
            {lastSortedNumbers.slice(-6).map((number, index) => (
              <div
                key={index}
                className="w-8 h-8 min-w-8 min-h-8 flex items-center justify-center rounded-sm text-white"
                style={{
                  backgroundColor: number.color,
                }}
              >
                {number.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        id="roulette-wheel-container"
        className="flex-auto border-l-2 border-[#626B78] flex flex-co h-full items-center justify-center"
      >
        <RouletteWheel
          onAnimationComplete={onSpinRouletteComplete}
          spinDegrees={spinDegrees}
        ></RouletteWheel>
      </div>

      {gameState === RouletteState.RESOLVING_BETS && (
        <div
          id="resolving-bets-wrapper"
          className="w-full h-full opacity-70 bg-black absolute top-0 left-0 flex justify-center items-center"
        >
          {/* Animação na opacidade ? */}
          <span className="font-bold text-xl">
            Aguardando início de novo Round...
          </span>
        </div>
      )}
    </div>
  );
}
