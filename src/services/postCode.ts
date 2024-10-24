import axios from "axios";

function postCode(roomId: any, value: any) {
  axios
    .post(
      "https://lcinterviewer-f71f.restdb.io/rest/codes-from-lcinterviewer",
      { roomId: roomId, code: value },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "cache-control": "no-cache",
          "x-apikey": "0a1bc2c956f3e5abbe388499ace920dae7c0b",
          "content-type": "application/json",
        },
      }
    )
    .then((response: any) => {
      console.log(response.data);
    })
    .catch((error: any) => {
      console.error(error);
    });
}

export default postCode;
