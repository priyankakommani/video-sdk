// getting Elements from Dom
const leaveButton = document.getElementById("leaveBtn");
const toggleMicButton = document.getElementById("toggleMicBtn");
const createButton = document.getElementById("createMeetingBtn");
const audioContainer = document.getElementById("audioContainer");
const textDiv = document.getElementById("textDiv");

// declare Variables
let meeting = null;
let meetingId = "";
let isMicOn = false;

// Join Agent Meeting Button Event Listener
createButton.addEventListener("click", async () => {
    document.getElementById("join-screen").style.display = "none";
    textDiv.textContent = "Please wait, we are joining the meeting";
    meetingId = ROOM_ID;
    initializeMeeting();
});

// Initialize meeting
function initializeMeeting() {
    window.VideoSDK.config(TOKEN);
    meeting = window.VideoSDK.initMeeting({
        meetingId: meetingId,
        name: "C.V.Raman",
        micEnabled: true,
        webcamEnabled: false,
    });
meeting.join();

meeting.localParticipant.on("stream-enabled", (stream) => {
if (stream.kind === "audio") {
setAudioTrack(stream, meeting.localParticipant, true);
}
});

meeting.on("meeting-joined", () => {
textDiv.textContent = null;
document.getElementById("grid-screen").style.display = "block";
document.getElementById("meetingIdHeading").textContent = `Meeting Id: ${meetingId}`;
});

meeting.on("meeting-left", () => {
audioContainer.innerHTML = "";
});

meeting.on("participant-joined", (participant) => {
let audioElement = createAudioElement(participant.id);
participant.on("stream-enabled", (stream) => {
if (stream.kind === "audio") {
setAudioTrack(stream, participant, false);
audioContainer.appendChild(audioElement);
}
});
});

meeting.on("participant-left", (participant) => {
let aElement = document.getElementById(`a-${participant.id}`);
if (aElement) aElement.remove();
});
}

// Create audio elements for participants
function createAudioElement(pId) {
let audioElement = document.createElement("audio");
audioElement.setAttribute("autoPlay", "false");
audioElement.setAttribute("playsInline", "true");
audioElement.setAttribute("controls", "false");
audioElement.setAttribute("id", `a-${pId}`);
audioElement.style.display = "none";
return audioElement;
}

// Set audio track
function setAudioTrack(stream, participant, isLocal) {
if (stream.kind === "audio") {
if (isLocal) {
isMicOn = true;
} else {
const audioElement = document.getElementById(`a-${participant.id}`);
if (audioElement) {
const mediaStream = new MediaStream();
mediaStream.addTrack(stream.track);
audioElement.srcObject = mediaStream;
audioElement.play().catch((err) => console.error("audioElem.play() failed", err));
}
}
}
}

// Implement controls
leaveButton.addEventListener("click", async () => {
meeting?.leave();
document.getElementById("grid-screen").style.display = "none";
document.getElementById("join-screen").style.display = "block";
});

toggleMicButton.addEventListener("click", async () => {
if (isMicOn) meeting?.muteMic();
else meeting?.unmuteMic();
isMicOn = !isMicOn;
});