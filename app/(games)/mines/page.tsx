"use client";
import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/app/contexts/socket-context";
import { useFirstRender } from "@/app/hooks/use-first-render-hook";
import { DeepCopy } from "@/app/auxiliares/deep-copy";
import { MinesState } from "./auxiliares/mines-state";
import { MinesBoardBlockState } from "./auxiliares/mines-board-block-state";
import { INITIAL_MINES_BOARD } from "./auxiliares/initial-mines-board";

export default function Page() {
  const { socket } = useSocket();
  const isFirstRender = useFirstRender();

  // Emitted Socket Events
  const GAME_MINES_START_EVENT = "game:mines:start";
  const GAME_MINES_SELECT_BLOCK_EVENT = "game:mines:select-block";
  const GAME_MINES_FINALIZE_GAME_EVENT = "game:mines:finalize-game";

  // Listened Socket Events
  const GAME_MINES_GAME_STARTED = "game:mines:game-started";
  const GAME_MINES_SELECT_BLOCK_SUCCESS = "game:mines:select-block-success";
  const GAME_MINES_SELECT_BLOCK_FAILURE = "game:mines:select-block-failure";

  const [gameState, setGameState] = useState<MinesState>(
    MinesState.WAITING_START
  );
  const [betAmount, setBetAmount] = useState("0");
  const [bombsQuantity, setBombsQuantity] = useState(3);
  const [minesBoard, setMinesBoard] = useState<MinesBoardBlockState[][]>(
    DeepCopy(INITIAL_MINES_BOARD)
  );

  const [currentAmountMultiplier, setCurrentAmountMultiplier] = useState(1);
  const [nextAmountMultiplier, setNextAmountMultiplier] = useState<
    number | null
  >(1);
  const [lastingDiamonds, setLastDiamonds] = useState(0);
  const [tempWinAmount, setTempWinAmount] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.on(
        GAME_MINES_GAME_STARTED,
        ({
          newCurrentMultiplier,
          newNextMultiplier,
          lastingDiamonds,
          tempWinAmount,
        }: {
          newCurrentMultiplier: number;
          newNextMultiplier: number | null;
          lastingDiamonds: number;
          tempWinAmount: number;
        }) => {
          setGameState(MinesState.ACTIVE);

          setCurrentAmountMultiplier(newCurrentMultiplier);
          setNextAmountMultiplier(newNextMultiplier);
          setLastDiamonds(lastingDiamonds);
          setTempWinAmount(tempWinAmount);
        }
      );

      socket.on(
        GAME_MINES_SELECT_BLOCK_SUCCESS,
        ({
          rowIndex,
          colIndex,
          newCurrentMultiplier,
          newNextMultiplier,
          lastingDiamonds,
          tempWinAmount,
        }: {
          rowIndex: number;
          colIndex: number;
          newCurrentMultiplier: number;
          newNextMultiplier: number | null;
          lastingDiamonds: number;
          tempWinAmount: number;
        }) => {
          setMinesBoard((prevBoard) => {
            const currBoard = DeepCopy(prevBoard);
            currBoard[rowIndex][colIndex] = MinesBoardBlockState.DIAMOND;
            return currBoard;
          });

          setCurrentAmountMultiplier(newCurrentMultiplier);
          setNextAmountMultiplier(newNextMultiplier);
          setLastDiamonds(lastingDiamonds);
          setTempWinAmount(tempWinAmount);
        }
      );

      socket.on(
        GAME_MINES_SELECT_BLOCK_FAILURE,
        ({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
          setMinesBoard((prevBoard) => {
            const currBoard = DeepCopy(prevBoard);
            currBoard[rowIndex][colIndex] = MinesBoardBlockState.BOMB;
            return currBoard;
          });

          setGameState(MinesState.WAITING_START);
        }
      );
    }
  }, [socket]);

  const startGame = () => {
    if (!betAmount) return;
    if (!bombsQuantity) return;

    console.log("Start game");
    setMinesBoard(DeepCopy(INITIAL_MINES_BOARD));

    socket?.emit(GAME_MINES_START_EVENT, {
      bombsQuantity,
      betAmount,
    });
  };

  const selectBlock = (row: number, column: number) => {
    socket?.emit(GAME_MINES_SELECT_BLOCK_EVENT, {
      rowIndex: row,
      colIndex: column,
    });
  };

  const finalizeGame = () => {
    socket?.emit(GAME_MINES_FINALIZE_GAME_EVENT);

    setGameState(MinesState.WAITING_START);
    setMinesBoard(DeepCopy(INITIAL_MINES_BOARD));
  };

  const buildBlock = (state: MinesBoardBlockState) => {
    switch (state) {
      case MinesBoardBlockState.EMPTY:
        return "";
      case MinesBoardBlockState.BOMB:
        return "💣";
      case MinesBoardBlockState.DIAMOND:
        return "💎";
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

        {gameState === MinesState.WAITING_START ? (
          <>
            <h3 className="text-sm mt-2">Número de Minas</h3>
            <select
              value={bombsQuantity}
              className="mt-1 w-full h-10 bg-[#0F1923] rounded-md pl-2 text-white outline-none text-xs"
              onChange={(e) => setBombsQuantity(Number(e.target.value))}
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
              onClick={startGame}
              className="mt-6 bg-[#a31f1f] w-full h-10 font-bold text-xs hover:bg-red-600 rounded-md transition duration-500 ease-out"
            >
              Apostar
            </button>
          </>
        ) : (
          <>
            <div
              className="
                w-full
                flex flex-col items-centers
              "
            >
              <h3 className="text-sm mt-2">Multiplicador Atual</h3>
              <div className="w-full h-10 bg-[#0F1923] rounded-md pl-2 text-white text-xs flex items-center">
                <span>{currentAmountMultiplier.toFixed(2)} x</span>
              </div>
            </div>

            <div
              className="
                w-full
                flex flex-col items-centers
              "
            >
              <h3 className="text-sm mt-2">Próximo Multiplicador</h3>
              <div className="w-full h-10 bg-[#0F1923] rounded-md pl-2 text-white text-xs flex items-center">
                <span>{nextAmountMultiplier?.toFixed(2) || "∞"} x</span>
              </div>
            </div>

            <div className="w-full flex flex-row justify-between items-center gap-2">
              <div
                className="
                w-full
                flex flex-col items-centers
              "
              >
                <h3 className="text-sm mt-2">Minas</h3>
                <div className="w-full h-10 bg-[#0F1923] rounded-md pl-2 text-white text-xs flex items-center">
                  {bombsQuantity}
                </div>
              </div>
              <div
                className="
                w-full
                flex flex-col items-centers
              "
              >
                <h3 className="text-sm mt-2">Diamantes</h3>
                <div className="w-full h-10 bg-[#0F1923] rounded-md pl-2 text-white text-xs flex items-center">
                  {lastingDiamonds}
                </div>
              </div>
            </div>

            <button
              onClick={finalizeGame}
              className="mt-6 bg-[#a31f1f] w-full h-10 font-bold text-xs hover:bg-red-600 rounded-md transition duration-500 ease-out"
            >
              Retirar R$ {tempWinAmount.toFixed(2)}
            </button>
          </>
        )}
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
                    onClick={
                      cell === MinesBoardBlockState.EMPTY &&
                      gameState === MinesState.ACTIVE
                        ? () => selectBlock(rowIndex, cellIndex)
                        : () => null
                    }
                    style={{}}
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
