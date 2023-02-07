import BaseSlashCommand from '../utils/BaseSlashCommand.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import StudentVue from 'studentvue/lib/StudentVue/StudentVue.js';
import { Users } from '../models/database.js';

export default class ScheduleSlashCommand extends BaseSlashCommand {
    constructor() {
      super('schedule');
    }

    async run(client, interaction) {
      const user = await Users.findOne({
        where: {
          discordId: interaction.user.id,
        },
      });
      if (!user) return interaction.reply({ content: 'Please login with /login before using this command.', ephemeral: true});
      
      const student = await StudentVue.login(user.domain, { username: user.username, password: user.password});
      if (!student) return await interaction.reply({ content: 'Invalid StudentVUE credentials.', ephemeral: true});

      await interaction.deferReply("Getting Schedule...");

      const schedule = await student.schedule();
      if (schedule.today.length === 0) return await interaction.reply({ content: 'No schedule found, Must be a day off!.', ephemeral: true});

      const schoolName = String(schedule.today[0].name);
      const periods = schedule.today[0].classes;
      const roomNums = schedule.classes;

      const scheduleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Schedule for ${schoolName} School`)
            .setDescription(`Type: ${schedule.today[0].bellScheduleName}`)
            .setThumbnail('https://freesvg.org/img/robot-head.png')
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconUrl: '' });

      // Add Periods to Embed Fields
      for (let i = 0; i < periods.length; i++) {
        const startTime = new Date(periods[i].time.start);
        const endTime = new Date(periods[i].time.end);

        scheduleEmbed.addFields({
          name: String(`Period ${i} (${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()})`),
          value: String(`Class: ${periods[i].name}
                        Room: ${roomNums[i].room}
                        Teacher: ${periods[i].teacher.name}`)});
      }

      return await interaction.editReply({ embeds: [scheduleEmbed] });
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Get Current Schedule for Today")
            .toJSON();
      }
}