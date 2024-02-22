"use client";

import { use, useCallback, useEffect, useState } from "react";
import RouletteWheel from "./components/roulette-wheel";
import { RouletteNumbers } from "./auxiliares/roulette-numbers";
import { RouletteBetOptions } from "./auxiliares/routellet-bets-options";
import { useSocket } from "@/app/contexts/socket-context";

export default function Page() {
  const { socket } = useSocket();

  const DEFAULT_SPIN_ANGLE = 360 * 10; // Valor inicial do angulo de rotação da roleta (10 giros)
  const ROULETTE_NUMBERS_CIRCUNFERENCE_ANGLE = 360 / RouletteNumbers.length; // Angulo de cada número da roleta

  const GAME_ROULETTE_START_EVENT = "game:roulette:start";
  const GAME_ROULETTE_LEAVE_EVENT = "game:roulette:leave";
  const GAME_ROULETTE_BET_EVENT = "game:roulette:bet";
  const GAME_ROULETTE_SPIN_END_EVENT = "game:roulette:spin-end";
  const GAME_ROULETTE_TIME_FOR_BETS_EVENT = "game:roulette:time-for-bets";
  const GAME_ROULETTE_SPIN_EVENT = "game:roulette:spin";
  const GAME_ROULETTE_WAITING_FOR_BETS_EVENT = "game:roulette:waiting-for-bets";
  const GAME_ROULETTE_WINNER_EVENT = "game:roulette:winner";

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDegrees, setSpinDegrees] = useState(0);

  const [sortedNumber, setSortedNumber] = useState<RouletteNumbers>({
    value: "00",
    color: "#355e3b",
  });
  const [lastSortedNumbers, setLastSortedNumbers] = useState<RouletteNumbers[]>(
    [
      {
        value: "00",
        color: "#355e3b",
      },
    ]
  );

  const [betAmount, setBetAmount] = useState("0");
  const [betOption, setBetOption] = useState<RouletteBetOptions>(
    RouletteBetOptions.GREEN
  );

  useEffect(() => {
    if (socket) {
      socket.emit(GAME_ROULETTE_START_EVENT);

      socket.on(
        GAME_ROULETTE_SPIN_EVENT,
        ({ sortedNumber }: { sortedNumber: RouletteNumbers }) => {
          console.log("sortedNumber: " + sortedNumber);

          setSortedNumber(sortedNumber);
        }
      );

      // Verificar eventos time_for_bets e waiting_for_bets
      socket.on(GAME_ROULETTE_TIME_FOR_BETS_EVENT, () => {
        console.log("Waiting for bets");
      });

      socket.on(GAME_ROULETTE_WINNER_EVENT, ({ amount }) => {
        console.log("You win", amount);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (sortedNumber.value === "00") return;

    spinRoulette();
  }, [sortedNumber]);

  const spinRoulette = () => {
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

    setLastSortedNumbers((prev) => [...prev, sortedNumber]);
    setIsSpinning(true);
    setSpinDegrees((prev) => prev + rouletteNumbersAngleDistance);
  };

  const bet = () => {
    if (betAmount === "0") {
      return;
    }

    // Verificar se o usuário tem saldo suficiente

    socket?.emit(GAME_ROULETTE_BET_EVENT, {
      amount: Number(betAmount), // Verificar essa conversão
      betOption,
    });
  };

  const onSpinRouletteComplete = () => {
    setIsSpinning(false);

    socket?.emit(GAME_ROULETTE_SPIN_END_EVENT);
  };

  return (
    <div
      id="roulette-container"
      className="
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
            <input
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
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#a31f1f] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.RED ? "white" : "#a31f1f",
              }}
              onClick={() => setBetOption(RouletteBetOptions.RED)}
            >
              2x
            </div>
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#355e3b] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.GREEN ? "white" : "#355e3b",
              }}
              onClick={() => setBetOption(RouletteBetOptions.GREEN)}
            >
              14x
            </div>
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#171212] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.BLACK ? "white" : "#171212",
              }}
              onClick={() => setBetOption(RouletteBetOptions.BLACK)}
            >
              2x
            </div>
          </div>

          <div
            id="roulette-bets-options-2"
            className="flex h-10 flex-row items-center justify-center mt-2 gap-2"
          >
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#a31f1f] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.ODD ? "white" : "#a31f1f",
              }}
              onClick={() => setBetOption(RouletteBetOptions.ODD)}
            >
              PAR
            </div>
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#171212] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOption === RouletteBetOptions.EVEN ? "white" : "#171212",
              }}
              onClick={() => setBetOption(RouletteBetOptions.EVEN)}
            >
              ÍMPAR
            </div>
          </div>

          <button
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
          <h3 className=" text-sm">Últimos números</h3>

          <div
            id="numbers-historic-container"
            className="mt-4 w-full h-8 flex flex-row items-center gap-2 overflow-x-auto overflow-y-hidden"
          >
            {lastSortedNumbers.map((number, index) => (
              <div
                key={index}
                className="w-8 h-8 bg-[#a31f1f] flex items-center justify-center rounded-sm text-white"
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
    </div>
  );
}
