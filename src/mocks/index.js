const users = [
    {
        sitPlace:1,
        flag:'flag:us-4x3',
        name:'Anzelina',
        balance:134500,
        betStatus:'AllIn',
        
        avatar:'/assets/random-users/1.jpg'
    },
    {
        sitPlace:2,
        flag:'emojione-v1:flag-for-canada',
        name:'Daniel',
        balance:100000,
        betStatus:'Check',
        avatar:'/assets/random-users/2.jpg'
    },
    {
        sitPlace:3,
        flag:'flag:us-4x3',
        name:'Josh',
        balance:234500,
        betStatus:'Raise',
        avatar:'/assets/random-users/3.jpg'
    },
    {
        sitPlace:4,
        flag:'emojione-v1:flag-for-india',
        name:'Aniya',
        balance:156500,
        betStatus:'Fold',
        avatar:'/assets/random-users/4.jpg'
    },
    {
        sitPlace:5,
        flag:'flag:us-4x3',
        name:'Joana',
        balance:534500,
        betStatus:'Check',
        avatar:'/assets/random-users/5.jpg'
    },
    {
        sitPlace:6,
        flag:'emojione-v1:flag-for-canada',
        name:'Swithen',
        balance:634500,
        betStatus:'AllIn',
        avatar:'/assets/random-users/6.jpg'
    },
    {
        sitPlace:7,
        flag:'emojione-v1:flag-for-russia',
        name:'Antonio',
        balance:834500,
        betStatus:'Raise',
        avatar:'/assets/random-users/7.jpg'
    },
    
]
const rooms = [
    {id:6, users, image:'/assets/dealer1.png', min:1000, max:50000},
    {id:1, users, image:'/assets/dealer2.png', min:1000, max:50000},
    {id:2, users, image:'/assets/dealer3.png', min:1000, max:50000},
    {id:3, users, image:'/assets/dealer2.png', min:1000, max:50000},
    {id:4, users, image:'/assets/dealer3.png', min:1000, max:50000},
    {id:5, users, image:'/assets/dealer1.png', min:1000, max:50000}
]

const deposits = [
    {id:1, coin:'btc', amount:3.23, chip:4000230, date:'2022-10-12'},
    {id:1, coin:'btc', amount:1.2, chip:2300230, date:'2022-09-15'},
    {id:1, coin:'eth', amount:43, chip:4210230, date:'2022-08-9'},
    {id:1, coin:'usdt', amount:3023, chip:4560230, date:'2022-07-21'},
    {id:1, coin:'bnb', amount:12.3, chip:4000230, date:'2022-06-8'}
]
const wagers = users.slice(0,3);
const winners = users.slice(2,5);

export {
    users,
    rooms,
    wagers,
    winners,
    deposits
}