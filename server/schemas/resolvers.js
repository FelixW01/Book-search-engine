
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    // queries for the current user information
    me: async (parent, args, context) =>
    {
        //context.user is undefined, crashing savedBooks whenever it's referenced
        console.log(context.user, "<<<<<<<<<<<<<< ME CONTEXT.USER")
        if (context.user) {
            const user = await User.findOne({_id: context.user._id})
            console.log(user, "<<<<<<<<<<<<<< USER")
            return user;
        }
        throw new AuthenticationError('Not logged in!')
    },
 },
  Mutation: {
    // login mutation, find by email if !email, then user is nonexistent, assigns a token when successfull.
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
    // addUser mutation, creates a user by username, email and password
    addUser: async (parent, {username, email, password}) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
    },
    // saveBook mutation, find user by id, push newBook to it's savedBooks array
    saveBook: async (parent, { newBook }, context) => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: newBook }},
                { new: true }
            );
            return updatedUser;
        }
    },
    // removeBook mutation, find user by id, pull book from it's savedBooks array by bookId
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
                {_id: context.user._id},
                {$pull: { savedBooks: {bookId}}},
                {new: true}
            )
            return updatedUser;
        }
        throw new AuthenticationError("Please log in to remove!")
    },
  },
};

module.exports = resolvers;