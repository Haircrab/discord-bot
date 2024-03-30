import { QueueRepeatMode, useQueue } from 'discord-player';
import { ApplicationCommandOptionType } from 'discord.js';
import { isInVoiceChannel } from "../utils/voicechannel";

export const name = 'loop';
export const description = 'Sets loop mode';
export const options = [
  {
    name: 'mode',
    type: ApplicationCommandOptionType.Integer,
    description: 'Loop type',
    required: true,
    choices: [
      {
        name: 'Off',
        value: QueueRepeatMode.OFF,
      },
      {
        name: 'Track',
        value: QueueRepeatMode.TRACK,
      },
      {
        name: 'Queue',
        value: QueueRepeatMode.QUEUE,
      },
      {
        name: 'Autoplay',
        value: QueueRepeatMode.AUTOPLAY,
      },
    ],
  },
];
export async function execute(interaction) {
  try {
    const inVoiceChannel = isInVoiceChannel(interaction);
    if (!inVoiceChannel) {
      return;
    }

    await interaction.deferReply();

    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.currentTrack) {
      return void interaction.followUp({ content: '❌ | No music is being played!' });
    }

    const loopMode = interaction.options.getInteger('mode');
    queue.setRepeatMode(loopMode);
    const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶';

    return void interaction.followUp({
      content: `${mode} | Updated loop mode!`,
    });
  } catch (error) {
    console.log(error);
    return void interaction.followUp({
      content: 'There was an error trying to execute that command: ' + error.message,
    });
  }
}
