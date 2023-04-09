
var get_date = () => {
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return today.toLocaleDateString('en-US', options);
};


module.exports = { get_date };
