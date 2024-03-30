import { ApplicationCommandOptionType } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { isInVoiceChannel } from '../utils/voicechannel';

export const name = 'play';
export const description = 'Play a song in your channel!';
export const options = [
  {
    name: 'query',
    type: ApplicationCommandOptionType.String,
    description: 'The song you want to play',
    required: true,
  },
];
export async function execute(interaction) {
  const { default: Conf } = await import('conf');
  try {
    const inVoiceChannel = isInVoiceChannel(interaction);
    if (!inVoiceChannel) {
      return;
    }

    await interaction.deferReply();

    const player = useMainPlayer();
    const query = interaction.options.getString('query');
    const searchResult = await player.search(query);
    if (!searchResult.hasTracks()) return void interaction.followUp({ content: 'No results were found!' });

    try {
      const config = new Conf({ projectName: 'volume' });

      await player.play(interaction.member.voice.channel.id, searchResult, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild?.members.me,
            requestedBy: interaction.user.username,
          },
          leaveOnEmptyCooldown: 300000,
          leaveOnEmpty: true,
          leaveOnEnd: false,
          bufferingTimeout: 0,
          volume: config.get('volume') || 10,
          //defaultFFmpegFilters: ['lofi', 'bassboost', 'normalizer']
        },
      });

      await interaction.followUp({
        content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`,
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error has occurred!',
      });
      return console.log(error);
    }
  } catch (error) {
    await interaction.reply({
      content: 'There was an error trying to execute that command: ' + error.message,
    });
  }
}
