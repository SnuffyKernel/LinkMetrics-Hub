const ip = "localhost";
const portURL = 3000;
const portStats = 4000

async function shortenUrl() {
  const originalUrl = document.getElementById("originalUrl").value;

  try {
    const response = await axios.post(
      `http://${ip}:${portURL}/`,
      { originalUrl },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const shortenedUrl = response.data.shortUrl;
    document.getElementById(
      "shortenedUrl"
    ).innerHTML = `<span class="shortened-link" onclick="visitShortenedLink('${shortenedUrl}')"> Сокращенная ссылка: ${ip}:${portURL}/${shortenedUrl}</span>`;
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

async function visitShortenedLink(shortenedUrl) {
  try {
    window.open(`http://${ip}:${portURL}/${shortenedUrl}`, "_blank");

    await sendStat(shortenedUrl);
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

// async function sendStat(shortUrl) {
//   const timestamp = new Date().toISOString();
//   try {
//     await axios.post(
//       `http://${ip}:${port}/stats`,
//       { shortUrl, timestamp },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Ошибка при отправке статистики:", error);
//   }
// }

async function requestReport() {
  const dimensions = updateButtonStyles();
  try {
    const response = await axios.post(
      `http://${ip}:${portStats}/report`,
      { dimensions },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const textData = JSON.stringify(response.data, null, 2);

    const blob = new Blob([textData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "report.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Ошибка при запросе отчета:", error);
  }
}
