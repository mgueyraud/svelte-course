import { writable } from "svelte/store";

const meetups = writable([]);

const customMeetupsStore = {
    subscribe: meetups.subscribe,
    setMeetups: (meetupsArray) => {
        meetups.set(meetupsArray);
    },
    addMeetup: (meetupData) => {
        meetups.update(items => [meetupData, ...items]);
    },
    toggleFavorite: (id) => {
        meetups.update(items => {
            const updatedMeetup = { ...items.find(meetup => meetup.id === id) };
            updatedMeetup.isFavorite = !updatedMeetup.isFavorite;
            const meetupIndex = items.findIndex(meetup => meetup.id === id);
            const updatedMeetups = [...items];
            updatedMeetups[meetupIndex] = updatedMeetup;
            return updatedMeetups;
        });
    },
    updateMeetup: (id, meetupData) => {
        meetups.update(items => {
            const meetupIndex = items.findIndex(meetup => meetup.id === id);
            const updatedMeetups = [...items];
            updatedMeetups[meetupIndex] = { ...meetupData, id };
            return updatedMeetups;
        });
    },
    removeMeetup: (id) => {
        meetups.update(items => items.filter(el => el.id !== id));
    }
}

export default customMeetupsStore;