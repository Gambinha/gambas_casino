"use client";

import { use, useCallback, useEffect, useState } from "react";
import RouletteWheel from "./components/roulette-wheel";
import { RouletteNumbers } from "./auxiliares/roulette-numbers";
import { RouletteBetOptions } from "./auxiliares/routellet-bets-options";

export default function Page() {
  const DEFAULT_SPIN_ANGLE = 360 * 10; // Valor inicial do angulo de rotação da roleta (10 giros)
  const ROULETTE_NUMBERS_CIRCUNFERENCE_ANGLE = 360 / RouletteNumbers.length; // Angulo de cada número da roleta

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
  const [betOptions, setBetOptions] = useState<RouletteBetOptions>(
    RouletteBetOptions.BLACK
  );

  useEffect(() => {
    spinRoulette();
  }, []);

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

  const onBetRoulette = () => {
    console.log(betAmount, betOptions);
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
                  betOptions === RouletteBetOptions.RED ? "white" : "#a31f1f",
              }}
              onClick={() => setBetOptions(RouletteBetOptions.RED)}
            >
              2x
            </div>
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#355e3b] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOptions === RouletteBetOptions.GREEN ? "white" : "#355e3b",
              }}
              onClick={() => setBetOptions(RouletteBetOptions.GREEN)}
            >
              14x
            </div>
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#171212] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOptions === RouletteBetOptions.BLACK ? "white" : "#171212",
              }}
              onClick={() => setBetOptions(RouletteBetOptions.BLACK)}
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
                  betOptions === RouletteBetOptions.ODD ? "white" : "#a31f1f",
              }}
              onClick={() => setBetOptions(RouletteBetOptions.ODD)}
            >
              PAR
            </div>
            <div
              id="bet-option"
              className="flex-1 h-full bg-[#171212] flex items-center justify-center rounded-md cursor-pointer border-2 text-xs"
              style={{
                borderColor:
                  betOptions === RouletteBetOptions.EVEN ? "white" : "#171212",
              }}
              onClick={() => setBetOptions(RouletteBetOptions.EVEN)}
            >
              ÍMPAR
            </div>
          </div>

          <button
            onClick={onBetRoulette}
            className="mt-6 bg-[#a31f1f] w-full h-10 font-bold text-xs hover:bg-red-600 rounded-md transition duration-500 ease-out"
          >
            Apostar
          </button>
        </div>

        <div
          id="roulette-numbers-historic"
          className="w-full h-20 max-h-20 min-h-20 "
        >
          <h3 className=" text-sm">Últimos númeos</h3>

          <div
            id="numbers-historic-container"
            className="mt-4 w-full h-8 flex flex-row items-center gap-2 bg-red-300"
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
          onAnimationComplete={() => {
            setIsSpinning(false);
          }}
          spinDegrees={spinDegrees}
        ></RouletteWheel>
      </div>
    </div>
  );
}
