
const { saveBook } = require('../controllers/user-controller');
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) =>
    {
        if (context.user) {
            const userData = await User.findOne({_id: context.user._id}).select('-__v -password')
            return userData;
        }
        throw new AuthenticationError('Not logged in!')
    },
 },
  Mutations: {
    login: async ( parent, { email, password } ) => {
        const user = await User.findOne({ email });

        if (!user) {
            throw new AuthenticationError("Email not found. Please create an account!")
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw new AuthenticationError("Incorrect password!")
        }
        const token = signToken(user);
        return { token, user };
    },
    addUser: async (parent, {username, email, password}) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user }
    },
    saveBook: async (parent, { newBook }, context => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: newBook }},
                { new: true }
            );
            return updatedUser;
        }
    })
    removeBook

  }
};

module.exports = resolvers;