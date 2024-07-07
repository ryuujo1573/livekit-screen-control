use livekit::prelude::*;

#[tokio::main]
async fn main() {
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIxMzI1MzU4NzUsImlzcyI6ImRldmtleSIsIm5hbWUiOiJ0ZXN0MSIsIm5iZiI6MTcyMDI4NTQ3NSwic3ViIjoidGVzdGVlIiwidmlkZW8iOnsicm9vbSI6InRlc3Ryb29tIiwicm9vbUNyZWF0ZSI6dHJ1ZSwicm9vbUpvaW4iOnRydWV9fQ.G7lMSdbyYsU-LCmrkimWO4e5IX2j2HJsmpklWSolmmI";
    let server_url = "http://localhost:7880";
    let (room, mut room_events) = Room::connect(server_url, token, RoomOptions::default())
        .await
        .unwrap();

    while let Some(event) = room_events.recv().await {
        match event {
            RoomEvent::TrackSubscribed {
                track,
                publication,
                participant,
            } => {}
            _ => {}
        }
    }
}
