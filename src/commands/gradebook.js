import BaseSlashCommand from '../utils/BaseSlashCommand.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import StudentVue from 'studentvue/lib/StudentVue/StudentVue.js';
import { Users } from '../models/database.js';

export default class GradebookSlashCommand extends BaseSlashCommand {
    constructor() {
      super('gradebook');
    }

    async run(client, interaction) {
        // Get User from Database & Null Check
        const user = await Users.findOne({
          where: {
            discordId: interaction.user.id,
          },
        });
        if (!user) return interaction.reply({ content: 'Please login with /login before using this command.', ephemeral: true});
        
        // Login to StudentVue & Null Check
        const student = await StudentVue.login(user.domain, { username: user.username, password: user.password});
        if (!student) return await interaction.reply({ content: 'Invalid StudentVUE credentials.', ephemeral: true});

        // Defer Reply (gives user a loading state)
        await interaction.deferReply("Getting Gradebook...");

        // Create Embed
        const gradebookEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setThumbnail('https://freesvg.org/img/robot-head.png')
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}`, iconUrl: '' });

        const gradebook = await student.gradebook();

        // Display Overall Gradebook
        if (!(interaction.options.getInteger('period'))) {
          const markingPeriod = gradebook.reportingPeriod.current.name;

          gradebookEmbed.setTitle(`Overall Gradebook for ${markingPeriod}`);
          gradebookEmbed.setDescription(`Let's see how you're doing!`);

          // Add Each Course & Grade to Embed Fields
          for (let i = 0; i < gradebook.courses.length; i++) {
              gradebookEmbed.addFields({
                  name: String(`${gradebook.courses[i].period}: ${gradebook.courses[i].title}`),
                  value: String(`Overall Grade: ${gradebook.courses[i].marks[0].calculatedScore.raw} (${gradebook.courses[i].marks[0].calculatedScore.string})`)});
          }

          return await interaction.editReply({ embeds: [gradebookEmbed] });
        }

        // Display Gradebook for Specific Period
        const period = interaction.options.getInteger('period');
        if (period > gradebook.courses.length || period < 0) return await interaction.editReply({ content: 'Invalid Period Number.', ephemeral: true});

        const course = gradebook.courses[period - 1];
        const overallScore = course.marks[0].calculatedScore.raw;
        const categories = course.marks[0].weightedCategories;
        const assignments = course.marks[0].assignments;

        gradebookEmbed.setTitle(`Gradebook for ${course.title}`);
        gradebookEmbed.setDescription(`Overall Score: ${overallScore}%`);

        // Display Categories
        for (let i = 0; i < categories.length; i++) {
            gradebookEmbed.addFields({
                name: String(`${categories[i].type}`),
                value: String(`Score: ${categories[i].calculatedMark}%`),
                inline: true}
            );
        }

        gradebookEmbed.addFields({
            name: "Here's your gradebook:",
            value: "\n"
        });

        // Display Assignments
        for (let i = 0; i < assignments.length; i++) {
            gradebookEmbed.addFields({
                name: String(`${assignments[i].name}`),
                value: String(`Score: ${assignments[i].score.value}`)}
            );
        }

        return await interaction.editReply({ embeds: [gradebookEmbed] });
    }

    getSlashCommandJSON() {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Gets Student's Gradebook.")
        .addIntegerOption(option => 
          option.setName('period')
          .setDescription('Class Period to Check')
          .setRequired(false))
        .toJSON();
    } 
}