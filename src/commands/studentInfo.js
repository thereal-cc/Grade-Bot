const BaseSlashCommand = require('../utils/BaseSlashCommand.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const StudentVue = require('studentvue/lib/StudentVue/StudentVue.js');
const { Users } = require('../models/database.js');

module.exports = class StudentInfoSlashCommand extends BaseSlashCommand {
    constructor() {
      super('studentinfo');
    }

    async run(client, interaction) {
      const user = await Users.findOne({
        where: {
          discordId: interaction.user.id,
        }});
      if (!user) return interaction.reply({ content: 'Please login with /login before using this command.', ephemeral: true});
          
      // Login to StudentVue & Null Check
      const student = await StudentVue.login(user.domain, { username: user.username, password: user.password});
      if (!student) return await interaction.reply({ content: 'Invalid StudentVUE credentials.', ephemeral: true});

      // Check if StudentInfo works
      try {
        const info = await student.studentInfo();
      } catch (err) {
        console.error(err);
        return await interaction.reply({ content: 'There was an error getting your info', ephemeral: true});
      }

      // Get info if it is working
      const info = await student.studentInfo();
      const studentEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Student Information for ${user.username}`)
        .setDescription(`Domain: ${user.domain}`)
        .setThumbnail('https://freesvg.org/img/robot-head.png')
        .addFields(
          { name: 'Name', value: `${info.student.name} (${info.student.nickname})` },
          { name: 'Student ID', value: info.id },
          { name: 'Email', value: info.email },
          { name: 'Birthday', value: String(info.birthDate).substring(4, 16) },
          { name: 'School', value: info.currentSchool },
          { name: 'Grade', value: info.grade },
          { name: 'Counselor', value: `${info.counselor.name} (${info.counselor.email})` },
          { name: 'Homeroom', value: `${info.homeRoomTeacher.name} (${info.homeRoomTeacher.email})` }) 
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}`, iconUrl: '' });

      return await interaction.reply({ embeds: [studentEmbed] });
    }

    getSlashCommandJSON() {
      return new SlashCommandBuilder()
          .setName(this.name)
          .setDescription("Get Student Information")
          .toJSON();
    }
}