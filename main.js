// Google Calendar APIキーとカレンダーIDをここに設定してください
const API_KEY = 'AIzaSyAuQE80gvFQ545_31rRpLW4bpbSaAfeULc';
const CALENDAR_ID = 'c_1aae419b8adeabc9515b977df1d9120a7f6ffccb27076058b1f9a43e32eb81ea@group.calendar.google.com';

document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
});

async function fetchEvents() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${lastMonth}&timeMax=${nextMonthEnd}&singleEvents=true&orderBy=startTime`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const eventsContainer = document.getElementById('calendar-events');
        eventsContainer.innerHTML = '';

        if (data.items && data.items.length > 0) {
            data.items.forEach(event => {
                if (event.start && event.start.dateTime) {
                    const start = new Date(event.start.dateTime);
                    const end = new Date(event.end.dateTime);
                    
                    const eventDate = `${start.getMonth() + 1}/${start.getDate()}`;
                    const eventTime = `${start.getHours()}:${String(start.getMinutes()).padStart(2, '0')} ~ ${end.getHours()}:${String(end.getMinutes()).padStart(2, '0')}`;
                    
                    // イベントタイトルから時間情報を除去して場所を抽出
                    const titleWithoutTime = event.summary.replace(/\d{1,2}:\d{2}\s*~?\s*\d{1,2}:\d{2}/, '').trim();
                    const fullLocationText = event.location || titleWithoutTime; // locationプロパティがあればそれを使用、なければタイトルから抽出した場所を使用

                    // 郵便番号や都道府県から始まる詳細な住所情報を削除
                    const simpleLocationText = fullLocationText.split('、')[0].split(',')[0].trim();
                    
                    const p = document.createElement('p');
                    p.textContent = `${eventDate} ${eventTime}`;
                    
                    // 開催場所のテキストにGoogle Mapsのリンクを埋め込む
                    if (simpleLocationText) {
                        const mapLink = document.createElement('a');
                        mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(simpleLocationText)}`;
                        mapLink.textContent = simpleLocationText;
                        mapLink.target = '_blank'; // 新しいタブで開く
                        p.appendChild(document.createTextNode(' '));
                        p.appendChild(mapLink);
                    }

                    eventsContainer.appendChild(p);
                }
            });
        } else {
            const p = document.createElement('p');
            p.textContent = '現在、予定はありません。';
            eventsContainer.appendChild(p);
        }

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        const p = document.createElement('p');
        p.textContent = 'カレンダーの読み込みに失敗しました。';
        document.getElementById('calendar-events').appendChild(p);
    }
}
