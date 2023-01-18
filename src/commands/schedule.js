const BaseSlashCommand = require('../utils/BaseSlashCommand.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const StudentVue = require('studentvue/lib/StudentVue/StudentVue.js');
const { Users } = require('../models/database.js');

module.exports = class ScheduleSlashCommand extends BaseSlashCommand {
    constructor() {
      super('schedule');
    }

    async run(client, interaction) {
      // Get User from Database & Check if Exists
      const user = await Users.findOne({
        where: {
          discordId: interaction.user.id,
        },
      });
      if (!user) return interaction.reply({ content: 'Please login with /login before using this command.', ephemeral: true});
      
      // Login to StudentVue & Null Check
      const student = await StudentVue.login(user.domain, { username: user.username, password: user.password});
      if (!student) return await interaction.reply({ content: 'Invalid StudentVUE credentials.', ephemeral: true});

      // Get Schedule & Null Check
      const schedule = await student.schedule();
      if (schedule.today.length === 0) return await interaction.reply({ content: 'No schedule found, Must be a day off!.', ephemeral: true});
      
      // School Name & Periods
      const schoolName = String(schedule.today[0].name);
      const periods = schedule.classes;

      // Create Embed
      const scheduleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Schedule for ${schoolName} School`)
            .setThumbnail('https://play-lh.googleusercontent.com/43vg9yqJ6keUxcLmlhILmpAGVG5q1XTpKtkUDMiggTWvzD7j_vi8bdqRI23dWnEy7A=w480-h960')
            .setDescription(`Type: ${schedule.today[0].bellScheduleName}`)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconUrl: '' });

      // Add Periods to Embed Fields
      for (let i = 0; i < periods.length; i++) {
        scheduleEmbed.addFields({
          name: String(`Period ${i}`),
          value: String(`Class: ${periods[i].name}
                        Room: ${periods[i].room}
                        Teacher: ${periods[i].teacher.name}`)});
        }

      return await interaction.reply({ embeds: [scheduleEmbed] });
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Get Current Schedule for Today")
            .toJSON();
      }
}