
export const getSundayOfWeek = (date: string): Date => {
    const sundayDate = new Date(date)

    sundayDate.setDate(sundayDate.getDate() - sundayDate.getDay())

    return sundayDate;
}

export const getSaturdayOfWeek = (date: string): Date => {
    let newDate = new Date(date)

    // getDay return 0 to 1 Sunday being 0 so we added 1 to get monday's Date
    const mondayOfWeek = newDate.getDate() - newDate.getDay() + 1

    // plus five to get Saturday
    const last = mondayOfWeek + 5

    const saturday = new Date(newDate.setDate(last))

    return saturday

}

export const areDatesEqual = (date1: Date, date2: Date): boolean => {
    const d1 = getDateFromDateTime(date1)
    const d2 = getDateFromDateTime(date2)

    return d1.valueOf() === d2.valueOf()
}

export const getDateFromDateTime = (date: Date): Date => {
    const day = ('0' + date.getDate()).slice(-2)
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const year = date.getFullYear()
    return new Date(`${year}-${month}-${day}`)
}


export const isDateValid = (date: Date): boolean => (
    date instanceof Date && !isNaN(date.valueOf())
)