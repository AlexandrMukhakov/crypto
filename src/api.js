const API_KEY = "380ec498044c900f249ad39326e8320a2cb4ee09b94afe4dff6911e37ef56bfc";

const tikersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);


const AGGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
        e.data
    );
    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return;
    }

    const handlers = tikersHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(newPrice));
});



function sendSocket(message) {
    const mess = JSON.stringify(message);
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(mess)
        return;
    }
    socket.addEventListener('open', () => {
        socket.send(mess);
    },
        { once: true }
    )
}


function subscrbeToTikerWebSock(tiker) {
    sendSocket({
        action: "SubAdd",
        subs: [`5~CCCAGG~${tiker}~USD`]

    })
}

function unsubscriberTikerWebSock(tiker) {
    sendSocket({
        action: "SubRemove",
        subs: [`5~CCCAGG~${tiker}~USD`]

    })
}




export const subscrbeToTiker = (tiker, cb) => {
    const handeTicker = tikersHandlers.get(tiker) || [];
    tikersHandlers.set(tiker, [...handeTicker, cb]);
    subscrbeToTikerWebSock(tiker);
}

export const unsubscriberTiker = tiker => {
    tikersHandlers.delete(tiker);
    unsubscriberTikerWebSock(tiker);
}