import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from 'react'
import cookieParser from '../cookieParser'

export function PlayerMatch() {
    const connection = useRef(null);                    // socket
    const navigate = useNavigate();                     // send them back to log-in
    const [srvrMsg, setSrvrMsg] = useState("");         // msg to be sent
    const [localMsg, setLocalMsg] = useState("");       // global msg that should be displayed to all users
    // phases (state diagram waow):
    //
    // l-move -> coin-move -> legal-moves -> l-move   (other players turn)
    //                            |
    //        (no legal moves)    V
    //                         game-end
    const [gameState, setGameState] = useState({
        player_1: "",
        player_2: "",
        player_turn: "player_1",
        phase: "l-move",
        no_turns: 0 
    })
    const [boardState, setBoardState] = useState({
        A1: {backgroundColor: 'black'},
        A2: {backgroundColor: 'grey'},
        A3: {backgroundColor: 'grey'},
        A4: {backgroundColor: 'grey'},

        B1: {backgroundColor: 'red'},
        B2: {backgroundColor: 'blue'},
        B3: {backgroundColor: 'blue'},
        B4: {backgroundColor: 'blue'},
        
        C1: {backgroundColor: 'red'},
        C2: {backgroundColor: 'red'},
        C3: {backgroundColor: 'red'},
        C4: {backgroundColor: 'blue'},

        D1: {backgroundColor: 'grey'},
        D2: {backgroundColor: 'grey'},
        D3: {backgroundColor: 'grey'},
        D4: {backgroundColor: 'black'}
    });
    const [selectedSquares, setSelectedSquares] = useState([]);

    let user = cookieParser(document.cookie).user;

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                    HOOKS
    // ---------------------------------------------------------------------------------------------------------------------

    // take user back to log-in if they are not logged in
    useEffect(() => {
        if (cookieParser(document.cookie).user == "") {
            navigate("/log-in");
        }
    }, []);

    // Socket hook
    useEffect(() => {
        console.log("start");

        // Socket object
        const socket = new WebSocket("ws://localhost:3001?user="+user); // url must be the same as app, but with ws protocol instead of http

        // Socket listen for connection opened
        socket.addEventListener("open", () => {
            console.log("["+user+"]: successfully connected to websocket server");
        });

        socket.addEventListener("close", () => {
            console.log("["+user+"]: successfully disconnected from websocket server");
        });

        // Socket listen for messages:
        //     user-enter: user has entered the room
        //     opponent-enter: opponent has entered the room, you need to give info on what they neeed to render
        //     phase-change: phange from one game phase to the other
        //     chat: player sends a message in chat
        //     l-move: player makes a move with their l piece
        //     coin-move: player makes a move with a coin piece
        //     game-end: game has ended, do appropriate teardown and point reward
        socket.addEventListener("message", (message) => {

            let parsed_message = JSON.parse(message.data);

            if (parsed_message.msg_type == "phase-change") {
                makePhaseChange(parsed_message);
            } else if (parsed_message.msg_type == "chat") {
                printMsg(parsed_message);
            } else if (parsed_message.msg_type == "l-move") {
                makeMove(parsed_message);
                sendPhaseChange("coin-move");
            } else if (parsed_message.msg_type == "coin-move") {
                makeMove(parsed_message);
                sendPhaseChange("l-move");
            } else {
                console.log("["+user+"]: tried to make action type: "+parsed_message.msg_type);
            }
        });

        connection.current = socket;

        // handler for page exit, close socket
        return () => (connection.current).close();

    }, [connection])

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                    CHAT
    // ---------------------------------------------------------------------------------------------------------------------

    // for dynamically updating local text
    const handleChange = (e) =>  {
        setLocalMsg(e.target.value);
    };

    // called by socket reciever here
    const printMsg = (parsed_message) => {
        console.log("["+user+"]: recieved message: "+parsed_message.msg_content);
        setSrvrMsg(parsed_message.msg_content);
    }

    // send data to socket server
    const sendMessage = (e) => {
        let message = {
            msg_type: "chat",
            msg_content: localMsg
        };
        console.log("["+user+"] sending message: "+localMsg);
        connection.current.send(JSON.stringify(message));
    };

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                PHASE-CHANGE
    // ---------------------------------------------------------------------------------------------------------------------

    // is called locally by socket reciever
    const makePhaseChange = (parsed_message) => {
        console.log("here1");
        console.log(parsed_message.msg_content.new_phase);
        if (parsed_message.msg_content.new_phase == 'l-move') {
            setGameState(prevState => ({...prevState, player_turn: (prevState.player_turn == "player_1" ? "player_2" : "player_1"), phase: 'l-move'}));
        } else if (parsed_message.msg_content.new_phase == 'coin-move') {
            setGameState(prevState => ({...prevState, phase: 'coin-move'}));
        } else if (parsed_message.msg_content.new_phase == 'legal-move') {
            console.log("here");
            setGameState(prevState => ({...prevState, phase: 'legal-move'}));
        }
    }
    
    // sends data to socket server
    const sendPhaseChange = (newPhase) => {
        let message = {
            msg_type: "phase-change",
            msg_content: {
                new_phase: newPhase
            }
        };
        console.log("["+user+"] is initating a phase change");
        connection.current.send(JSON.stringify(message));
    }

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                BUTTON FUNCTIONS
    // ---------------------------------------------------------------------------------------------------------------------

    // makes sure only legal moves are selected depending on game phase
    const selectButton = (e) => {
        console.log("phase: "+gameState.phase);
        if (gameState.phase == "l-move") {
            if (boardState[e.target.name].backgroundColor == 'grey') {
                updateSelected(e.target.name);
            } else {
                if ((gameState.player_turn == "player_1" && 
                    boardState[e.target.name].backgroundColor == 'red') ||

                    (gameState.player_turn == "player_2" && 
                    boardState[e.target.name].backgroundColor == 'blue')) {

                    updateSelected(e.target.name);
                }
            }
        } else if (gameState.phase == "coin-move") {
            if ((boardState[e.target.name].backgroundColor == 'black') || 
                (boardState[e.target.name].backgroundColor == 'grey')) {
                updateSelected(e.target.name);
            }
        }
    }

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                GENERIC MOVE
    // ---------------------------------------------------------------------------------------------------------------------

    // called by socket reciever here
    // only alters one square, to be called in succession by main handler
    // assumes whatever alteration it makes is legal
    const makeMove = (parsed_message) => {
        setBoardState(prevBoardState => ({
            ...prevBoardState, [parsed_message.msg_content.square]: {...prevBoardState[parsed_message.msg_content.square], backgroundColor: parsed_message.msg_content.colour}
        }));
        setSelectedSquares(prevSelectedSquares => prevSelectedSquares.filter(square => square !== parsed_message.msg_content.square));
    }

    // called local only because if socket reciever calls it it doesnt work for some reason (socket reciever just mimics functionality)
    // for selectedSquares list only
    const updateSelected = (name) => {
        if (!selectedSquares.includes(name)) {
            setSelectedSquares(prevSelectedSquares => ([...prevSelectedSquares, name]));
        } else {
            setSelectedSquares(prevSelectedSquares => prevSelectedSquares.filter(square => square !== name));
        }
    }

    // send data for single square to server for it to be updated on both peoples board
    const updateSquare = (type, name, colour) => {
        let message = {
            msg_type: type,
            msg_content: {
                square: name,
                colour: colour
            }
        };
        console.log("["+user+"] making l-move");
        connection.current.send(JSON.stringify(message));
    }

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                   L-MOVE
    // ---------------------------------------------------------------------------------------------------------------------

    // does server calls. doesn't do 4 squares at once but consecutively sends 4 different squares
    const sendLMove = () => {
        if (isValidLMove()) {
            let player_colour = (gameState.player_turn == "player_1") ? ('red') : ('blue');
            // reset all the old ones to grey
            for (const square in boardState) {
                if (boardState[square].backgroundColor == player_colour) {
                    console.log("rewriting "+square);
                    updateSquare('l-move', square, 'grey');
                }
            }
            // change new ones to player_colour
            selectedSquares.forEach((square) => {
                updateSquare('l-move', square, player_colour);
            });
        } else {
            console.log("not a valid l-move");
        }
    }

    // checks whether player l-move is valid.
    // is allowed to assume that only legal moves were made
    const isValidLMove = () => {
        // a move can be made iff wlog both:
        // 1. there are 3 of the same letter and the last one is adjacent
        // 2. there are 3 different numbers which are consecutive, they all have a count of 1 except for the largest xor smallest which has a count of 2
        if (selectedSquares.length != 4) {
            return false;
        }
        let freq = {
            letters: {A: 0, B: 0, C: 0, D: 0, E: 0},
            nums: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}                      // E and 5 are there so that the itteration doesnt go out of bounds
        };
        for (let i = 0; i < 4; i++) {
            freq.letters[selectedSquares[i][0]] += 1;
            freq.nums[selectedSquares[i][1]] += 1;
        }
        let permutation = {
            letter1: false,
            letter2: false,
            num1: false,
            num2: false
        };

        // check conditions among letters
        ['A', 'B', 'C'].forEach(i => {
            // checking for condition 1
            if ((freq.letters[i] == 1 && freq.letters[String.fromCharCode(i.charCodeAt(0) + 1)] == 3) || 
                (freq.letters[i] == 3 && freq.letters[String.fromCharCode(i.charCodeAt(0) + 1)] == 1)) {
                    permutation.letter1 = true;
                }
            // checking for condition 2 (note that when on C it will always return false)
            if ((freq.letters[i] == 2 && freq.letters[String.fromCharCode(i.charCodeAt(0) + 1)] == 1 && freq.letters[String.fromCharCode(i.charCodeAt(0) + 2)] == 1) ||
                (freq.letters[i] == 1 && freq.letters[String.fromCharCode(i.charCodeAt(0) + 1)] == 1 && freq.letters[String.fromCharCode(i.charCodeAt(0) + 2)] == 2)) {
                    permutation.letter2 = true;
                }
            }
        )
        console.log("for some reason the code breaks if this log isnt here 😭");
        // check conditions among numbers
        [1, 2, 3].forEach(i => {
            // checking for condition 1
            if ((freq.nums[i] == 1 && freq.nums[i+1] == 3) || 
                (freq.nums[i] == 3 && freq.nums[i+1] == 1)) {
                    permutation.num1 = true;
                }
            // checking for condition 2 (note that when on 3 it will always return false)
            if ((freq.nums[i] == 2 && freq.nums[i+1] == 1 && freq.nums[i+2] == 1) ||
                (freq.nums[i] == 1 && freq.nums[i+1] == 1 && freq.nums[i+2] == 2)) {
                    permutation.num2 = true;
                }
        })

        // in practice the same condition for both letter and num cant both be true because of pigeonhole principle
        if ((permutation.letter1 != permutation.letter2) && (permutation.num1 != permutation.num2)) {
            selectedSquares.forEach((square) => {
                // don't need to check who's turn it is because the selection process ensures that the player can rearrange only on their own pieces
                if (boardState[square].backgroundColor != "red" && boardState[square].background != "blue") {
                    // return true once any square deviates
                    return true;
                }
            })
            // only happens if every square overlaps with old l piece, meaning piece wasn't moved
            return true;
        } else {
            return false;
        }

    }

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                  COIN-MOVE
    // ---------------------------------------------------------------------------------------------------------------------

    // does sequence of server calls
    const sendCoinMove = () => {
        if (isValidCoinMove()) {
            // where coin previously was is now grey, where empty was is now coin
            selectedSquares.forEach((square) => {
                if (boardState[square].backgroundColor == 'grey') {
                    updateSquare('coin-move', square, 'black');
                } else if (boardState[square].backgroundColor == 'black') {
                    updateSquare('coin-move', square, 'grey');
                }
            });
        } else {
            console.log("not a valid coin move");
        }
    }

    // has to only check if exactly two squares are selected, and if exactly one of them is black and exactly one of them is grey
    const isValidCoinMove = () => {
        if (selectedSquares.length != 2) {
            console.log("bad size");
            return false;
        }
        let freq = {
            black: 0,
            grey: 0
        };
        for (let i = 0; i < 2; i++) {
            if (boardState[selectedSquares[i]].backgroundColor == 'grey') {
                freq.grey += 1;
            } else if (boardState[selectedSquares[i]].backgroundColor == 'black') {
                freq.black += 1;
            }
        }
        console.log("")
        return ((freq.black == 1) && (freq.grey == 1));
    }

    // ---------------------------------------------------------------------------------------------------------------------
    //                                                  RENDERING
    // ---------------------------------------------------------------------------------------------------------------------

    return (
        <div>
            Player Match
            <input
                onChange={handleChange}
                name="text"
                placeholder="Message..." />
            <button onClick={sendMessage}>Send</button>
            <p>local message: {localMsg}</p>
            <br></br>
            <p>global message: {srvrMsg}</p>
            <br></br>
            <p>{gameState.player_turn} turn to move...</p>
            <br></br>
            <p>Phase: {gameState.phase}</p>
            <br></br>
            <p>Selected squares: {selectedSquares}</p>

            <button // A1
                name="A1"
                onClick={selectButton}
                style={{backgroundColor: boardState.A1.backgroundColor}}>
                    
            </button>
            <button // B1
                name="B1"
                onClick={selectButton}
                style={{backgroundColor: boardState.B1.backgroundColor}}>
                    
            </button>
            <button // C1
                name="C1"
                onClick={selectButton}
                style={{backgroundColor: boardState.C1.backgroundColor}}>
                    
            </button>
            <button // D1
                name="D1"
                onClick={selectButton}
                style={{backgroundColor: boardState.D1.backgroundColor}}>
                    
            </button>

            <br></br>

            <button // A2
                name="A2"
                onClick={selectButton}
                style={{backgroundColor: boardState.A2.backgroundColor}}>
                    
            </button>
            <button // B2
                name="B2"
                onClick={selectButton}
                style={{backgroundColor: boardState.B2.backgroundColor}}>
                    
            </button>
            <button // C2
                name="C2"
                onClick={selectButton}
                style={{backgroundColor: boardState.C2.backgroundColor}}>
                    
            </button>
            <button // D2
                name="D2"
                onClick={selectButton}
                style={{backgroundColor: boardState.D2.backgroundColor}}>
                    
            </button>

            <br></br>       

            <button // A3
                name="A3"
                onClick={selectButton}
                style={{backgroundColor: boardState.A3.backgroundColor}}>
                    
            </button>
            <button // B3
                name="B3"
                onClick={selectButton}
                style={{backgroundColor: boardState.B3.backgroundColor}}>
                    
            </button>
            <button // C3
                name="C3"
                onClick={selectButton}
                style={{backgroundColor: boardState.C3.backgroundColor}}>
                    
            </button>
            <button // D3
                name="D3"
                onClick={selectButton}
                style={{backgroundColor: boardState.D3.backgroundColor}}>
                    
            </button>

            <br></br>

            <button // A4
                name="A4"
                onClick={selectButton}
                style={{backgroundColor: boardState.A4.backgroundColor}}>
                    
            </button>
            <button // B4
                name="B4"
                onClick={selectButton}
                style={{backgroundColor: boardState.B4.backgroundColor}}>
                    
            </button>
            <button // C4
                name="C4"
                onClick={selectButton}
                style={{backgroundColor: boardState.C4.backgroundColor}}>
                    
            </button>
            <button // D4
                name="D4"
                onClick={selectButton}
                style={{backgroundColor: boardState.D4.backgroundColor}}>
                    
            </button>

            <br></br>

            <button // submit l-move button
                onClick={sendLMove}>
                    Send l-move
            </button>

            <button // submit coin move button
                onClick={sendCoinMove}>
                    Send coin move
            </button>
        </div>
    );
}