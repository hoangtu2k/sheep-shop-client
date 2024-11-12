import { useContext, useEffect } from "react";
import { MyContext } from "../../App";


const Sell = () => {

    const context = useContext(MyContext);

    useEffect(() => {
        context.setisHideSidebarAndHeader(true);
      }, );

    return (
        <>



        </>
    )
}

export default Sell;