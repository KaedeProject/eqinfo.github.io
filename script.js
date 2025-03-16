document.addEventListener("DOMContentLoaded", function () {
    // タブ切り替え処理
    const tabs = document.querySelectorAll(".tab-button");
    const contents = document.querySelectorAll(".info-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(tab.getAttribute("data-tab") + "-info").classList.add("active");
        });
    });

    fetchEarthquakeInfo();
    fetchTsunamiInfo();

    setInterval(fetchEarthquakeInfo, 300000);
    setInterval(fetchTsunamiInfo, 300000);
});

// 📌 震度変換マップ
function convertIntensity(scale) {
    const intensityMap = {
        10: '震度1', 20: '震度2', 30: '震度3',
        40: '震度4', 45: '震度5弱', 50: '震度5強',
        55: '震度6弱', 60: '震度6強', 70: '震度7'
    };
    return intensityMap[scale] || '情報なし';
}

// 📌 地震情報の取得
function fetchEarthquakeInfo() {
    fetch('https://api.p2pquake.net/v2/history?codes=551&limit=2')
        .then(response => response.json())
        .then(data => {
            const infoDiv = document.getElementById('earthquake-info');
            infoDiv.innerHTML = "";
            data.forEach(earthquake => {
                const hypocenter = earthquake.earthquake?.hypocenter?.name || '情報なし';
                const magnitude = earthquake.earthquake?.hypocenter?.magnitude?.toFixed(1) || '情報なし';
                const maxIntensity = earthquake.earthquake?.maxScale || 0;
                const time = new Date(earthquake.earthquake?.time).toLocaleString('ja-JP');

                infoDiv.innerHTML += `
                    <div class="custom-card">
                        <p><strong>震源地:</strong> ${hypocenter}</p>
                        <p><strong>マグニチュード:</strong> ${magnitude}</p>
                        <p><strong>最大震度:</strong> ${convertIntensity(maxIntensity)}</p>
                        <p><strong>発生日時:</strong> ${time}</p>
                    </div>
                `;
            });
        })
        .catch(() => {
            document.getElementById('earthquake-info').innerHTML = '<p>データの取得に失敗しました。</p>';
        });
}

// 📌 津波情報の取得
function fetchTsunamiInfo() {
    fetch('https://www.data.jma.go.jp/developer/xml/feed/eqvol_l.xml')
        .then(response => response.text())
        .then(xmlText => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "text/xml");
            const items = xml.getElementsByTagName("entry");
            const infoDiv = document.getElementById('tsunami-info');
            infoDiv.innerHTML = "";
            for (let i = 0; i < items.length && i < 2; i++) {
                infoDiv.innerHTML += `<div class="custom-card"><p>${items[i].getElementsByTagName("title")[0].textContent}</p></div>`;
            }
        })
        .catch(() => {
            document.getElementById('tsunami-info').innerHTML = '<p>データの取得に失敗しました。</p>';
        });
}
