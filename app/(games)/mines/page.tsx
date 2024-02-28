"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/app/contexts/socket-context";
import { useFirstRender } from "@/app/hooks/use-first-render-hook";
import { DeepCopy } from "@/app/auxiliares/deep-copy";

enum MinesBoardBlockState {
  EMPTY = 0,
  BOMB = 1,
  FLAG = 2,
}

export default function Page() {
  const { socket } = useSocket();
  const isFirstRender = useFirstRender();

  // Emitted Socket Events
  const GAME_MINES_START_EVENT = "game:mines:start";
  const GAME_MINES_BET_EVENT = "game:mines:bet";

  // Listened Socket Events
  const GAME_MINES_CURRENT_GAME_CONTEXT = "game:mines:current-game-context";
  const GAME_MINES_WAITING_FOR_BETS_EVENT = "game:mines:waiting-for-bets";

  //   const [gameState, setGameState] = useState<minesState>(
  //     minesState.WAITING_FOR_BETS
  //   );

  const [executeLastingBetTimeTimer, setExecuteLastingBetTimeTimer] =
    useState(false);
  const [lastingBetTime, setLastingBetTime] = useState(0);
  const [maxWaitingForBetsTime, setMaxWaitingForBetsTime] = useState(0);

  const [betAmount, setBetAmount] = useState("0");
  const [minesQuantity, setMinesQuantity] = useState(2);

  const REAL_BOARD = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ];

  const [minesBoard, setMinesBoard] = useState<MinesBoardBlockState[][]>([
    [
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
    ],
    [
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
    ],
    [
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
    ],
    [
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
    ],
    [
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
      MinesBoardBlockState.EMPTY,
    ],
  ]);

  useEffect(() => {
    if (socket) {
      socket.emit(GAME_MINES_START_EVENT);

      socket.on(GAME_MINES_CURRENT_GAME_CONTEXT, (context: {}) => {});

      socket.on(GAME_MINES_WAITING_FOR_BETS_EVENT, ({}: {}) => {});
    }
  }, [socket]);

  const selectBlock = (row: number, column: number) => {
    // Enviar para o backend
    const currBoard = DeepCopy(minesBoard);

    if (REAL_BOARD[row][column] === 1) {
      currBoard[row][column] = MinesBoardBlockState.FLAG;
      // Continua
    } else {
      currBoard[row][column] = MinesBoardBlockState.BOMB;
      // Perdeu
    }

    setMinesBoard(currBoard);
  };

  const buildBlock = (state: MinesBoardBlockState) => {
    switch (state) {
      case MinesBoardBlockState.EMPTY:
        return "";
      case MinesBoardBlockState.BOMB:
        return "💣";
      case MinesBoardBlockState.FLAG:
        return "🚩";
    }
  };

  return (
    <div
      id="mines-container"
      className="
        relative
        w-[98%] min-w-96 h-[440px] 
        flex flex-row items-center bg-[#252F38] rounded-md"
    >
      <div
        id="mines-infos-container"
        className="
        flex-1 h-full max-w-[17rem] w-[17rem] min-w-[14rem]
        p-4 flex flex-col
      "
      >
        <div
          id="mines-bets-input-box"
          className="
          w-full h-10 relative
          flex items-center justify-center
          mt-4
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

        <h3 className="text-sm mt-2">Número de Minas</h3>
        <select
          value={minesQuantity}
          className="mt-1 w-full h-10 bg-[#0F1923] rounded-md pl-2 text-white outline-none text-xs"
          onChange={(e) => setMinesQuantity(Number(e.target.value))}
        >
          {[...Array(23)].map((_, index) => {
            return (
              <option key={index} value={index + 2}>
                {index + 2}
              </option>
            );
          })}
        </select>

        <button
          onClick={() => {}}
          className="mt-6 bg-[#a31f1f] w-full h-10 font-bold text-xs hover:bg-red-600 rounded-md transition duration-500 ease-out"
        >
          Apostar
        </button>
      </div>

      <div
        id="mines-wheel-container"
        className="flex-auto border-l-2 border-[#626B78] flex flex-col h-full items-center justify-center"
      >
        {minesBoard.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="flex flex-row">
              {row.map((cell, cellIndex) => {
                return (
                  <div
                    key={cellIndex}
                    className="
                        w-16 h-16 m-1
                        border-2 border-[#626B78]
                        flex items-center justify-center
                        text-[#626B78]
                        cursor-pointer
                        "
                    onClick={() => selectBlock(rowIndex, cellIndex)}
                  >
                    {buildBlock(cell)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
