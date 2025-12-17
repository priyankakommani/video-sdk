from videosdk.agents import Agent, AgentSession, RealTimePipeline, JobContext, RoomOptions, WorkerJob
from videosdk.plugins.google import GeminiRealtime, GeminiLiveConfig
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logging.getLogger().setLevel(logging.INFO)


class MyVoiceAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are a high-energy game-show host guiding the caller to guess a secret number from 1 to 100 to win 1,000,000$.",
        )

    async def on_enter(self) -> None:
        await self.session.say(
            "Welcome to the Videosdk's AI Agent game show! I'm your host, and we're about to play for 1,000,000$. Are you ready to play?"
        )

    async def on_exit(self) -> None:
        await self.session.say("Goodbye!")


async def start_session(context: JobContext):
    agent = MyVoiceAgent()
    
    # Get API key from environment variable
    google_api_key = os.getenv("GOOGLE_API_KEY")
    
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables. Please check your .env file.")
    
    model = GeminiRealtime(
        model="gemini-2.5-flash-native-audio-preview-12-2025",
        api_key=google_api_key,
        config=GeminiLiveConfig(
            voice="Leda",  # Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, and Zephyr.
            response_modalities=["AUDIO"]
        )
    )

    pipeline = RealTimePipeline(model=model)
    session = AgentSession(agent=agent, pipeline=pipeline)

    def on_transcription(data: dict):
        role = data.get("role")
        text = data.get("text")
        print(f"[TRANSCRIPT][{role}]: {text}")

    pipeline.on("realtime_model_transcription", on_transcription)

    await context.run_until_shutdown(session=session, wait_for_participant=True)


def make_context() -> JobContext:
    room_options = RoomOptions(
        room_id="ew2z-xxuz-6kd8",
        name="Gemini Agent",
        playground=True,
    )
    return JobContext(room_options=room_options)


if __name__ == "__main__":
    job = WorkerJob(entrypoint=start_session, jobctx=make_context)
    job.start()