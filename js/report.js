export const Report = {
    export: () => {
        const rows = Array.from(document.querySelectorAll('#attendance-body tr')).map(tr => tr.innerText);
        const csvContent = "data:text/csv;charset=utf-8," + "Họ Tên\n" + rows.join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "Bao_Cao_Diem_Danh.csv");
        document.body.appendChild(link); link.click();
    }
};
